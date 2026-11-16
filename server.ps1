param([int]$Port = 8901, [string]$Root = ".")
$Root = (Resolve-Path $Root).Path
$Http = [System.Net.HttpListener]::new()
$Http.Prefixes.Add("http://localhost:$Port/")
$Http.Start()
"LISTENING $Port root=$Root"

function Send-Json($res, $obj, [int]$Code = 200) {
    $json = ConvertTo-Json -InputObject $obj -Depth 6 -Compress
    if ($null -eq $json) { $json = "[]" }
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
    $res.StatusCode = $Code
    $res.ContentType = "application/json; charset=utf-8"
    $res.AddHeader("Cache-Control", "no-store")
    $res.ContentLength64 = $bytes.Length
    $res.OutputStream.Write($bytes, 0, $bytes.Length)
    $res.Close()
}
function Read-JsonBody($req) {
    $ms = New-Object System.IO.MemoryStream
    $req.InputStream.CopyTo($ms)
    $bytes = $ms.ToArray()
    $text = [System.Text.Encoding]::UTF8.GetString($bytes)
    $text | ConvertFrom-Json
}
function userwords-file($Root) { Join-Path (Join-Path $Root "userwords") "words.json" }
function Get-UserWords($Root) {
    $file = userwords-file $Root
    if (-not (Test-Path -LiteralPath $file)) { return @() }
    $raw = [System.IO.File]::ReadAllText($file)
    if ($raw.Trim().Length -eq 0) { return @() }
    $data = $raw | ConvertFrom-Json
    if (-not $data) { return @() }
    return @($data)
}
function Save-UserWords($Root, $list) {
    $dir = Join-Path $Root "userwords"
    if (-not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
    $file = userwords-file $Root
    if (-not $list -or @($list).Count -eq 0) {
        if (Test-Path -LiteralPath $file) { Remove-Item -LiteralPath $file -Force }
        return
    }
    $json = ConvertTo-Json -InputObject @($list) -Depth 6
    [System.IO.File]::WriteAllText($file, $json, (New-Object System.Text.UTF8Encoding($false)))
}

while ($Http.IsListening) {
    try {
        $ctx = $Http.GetContext()
        $req = $ctx.Request
        $res = $ctx.Response
        $rel = ($req.Url.AbsolutePath.TrimStart('/') -replace '%20', ' ').TrimStart('/')
        if ($rel -eq "" ) { $rel = "index.html" }

        # Пользовательский словарь: GET — список, POST — добавить/изменить, DELETE ?en= — удалить
        if ($rel -eq "__userwords") {
            $method = $req.HttpMethod
            if ($method -eq "GET") { $list = @(Get-UserWords $Root); Send-Json $res $list; continue }
            if ($method -eq "POST") {
                try {
                    $body = Read-JsonBody $req
                    if (-not $body.en -or -not $body.ru) { Send-Json $res @{ error = "en and ru required" } 400; continue }
                    $en = [string]$body.en
                    $new = @{
                        en   = $en
                        ru   = [string]$body.ru
                        lvl  = [string]$body.lvl
                        pos  = [string]$body.pos
                        note = [string]$body.note
                    }
                    $list = @(Get-UserWords $Root)
                    $hit = $false
                    $out = @($list | ForEach-Object {
                        if ($_.en -ieq $en) { $hit = $true; $new } else { $_ }
                    })
                    if (-not $hit) { $out = @($out) + $new }
                    Save-UserWords $Root $out
                    Send-Json $res $out
                    continue
                } catch { Send-Json $res @{ error = "bad request" } 400; continue }
            }
            if ($method -eq "DELETE") {
                $en = [string]$req.QueryString["en"]
                $list = @(Get-UserWords $Root)
                $list = @($list | Where-Object { $_.en -ine $en })
                Save-UserWords $Root $list
                Send-Json $res $list
                continue
            }
            Send-Json $res @{ error = "method not allowed" } 405
            continue
        }

        $full = [System.IO.Path]::GetFullPath((Join-Path $Root $rel))
        $fullRoot = [System.IO.Path]::GetFullPath($Root)
        # Строго внутри корня: добавляем разделитель, чтобы "NZ2" не прошёл проверку как "NZ"
        if (-not $full.StartsWith($fullRoot.TrimEnd('\') + '\')) { $res.StatusCode = 403; $res.Close(); continue }
        if (-not (Test-Path -LiteralPath $full -PathType Leaf)) { $res.StatusCode = 404; $res.Close(); continue }
        $bytes = [System.IO.File]::ReadAllBytes($full)
        $ext = [System.IO.Path]::GetExtension($full).ToLower()
        $mime = switch ($ext) {
            ".html" { "text/html; charset=utf-8" }
            ".js"   { "application/javascript; charset=utf-8" }
            ".css"  { "text/css; charset=utf-8" }
            ".png"  { "image/png" }
            ".jpg"  { "image/jpeg" }
            ".gif"  { "image/gif" }
            ".svg"  { "image/svg+xml" }
            ".ico"  { "image/x-icon" }
            ".woff2"{ "font/woff2" }
            ".ttf"  { "font/ttf" }
            ".otf"  { "font/otf" }
            default { "application/octet-stream" }
        }
        $res.ContentType = $mime
        if ($ext -eq ".html") {
            $res.AddHeader("Cache-Control", "no-cache, no-store, must-revalidate")
            $res.AddHeader("Pragma", "no-cache")
            $res.AddHeader("Expires", "0")
        }
        $res.ContentLength64 = $bytes.Length
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
        $res.Close()
    } catch {
        try { $res.StatusCode = 500; $res.Close() } catch {}
    }
}