# Mutation testing for dsh-sidebar-pins.
#
# Each mutation reintroduces one behaviour the plugin must keep; the suite must
# then fail. A mutation that survives means the suite is too weak — that is the
# signal this script exists to catch.
#
# Paths resolve relative to this script, so the checkout can live anywhere.
$ErrorActionPreference = 'Stop'

$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$pluginRoot = Split-Path -Parent $here
$target = Join-Path $pluginRoot 'client/index.js'
$suite = Join-Path $here 'render.test.mjs'
$node = 'node'

$orig = Get-Content $target -Raw
$newline = "`n"

$mutations = @(
  @{ n = 'invert-toggle';    from = 'onPinnedChange(id, !nextFolded);';                                       to = 'onPinnedChange(id, nextFolded);' },
  @{ n = 'drop-persist';     from = 'localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));';         to = 'void 0;' },
  @{ n = 'drop-defaults';    from = "const DEFAULT_FOLDED = ['remote-wsl', 'paper-os', 'love'];";            to = 'const DEFAULT_FOLDED = [];' },
  @{ n = 'share-style-tag';  from = 'ensureStyleTag(uiStyleTagId).textContent = CSS;';                       to = 'ensureStyleTag(hideStyleTagId).textContent = CSS;' },
  @{ n = 'never-clear-flag'; from = 'else row.removeAttribute(HIDDEN_FLAG);';                                to = 'else void 0;' },
  @{ n = 'no-retry';         from = ('sync();' + $newline + '          scheduleSettle();');                  to = 'sync();' }
)

$survived = 0
foreach ($m in $mutations) {
  $mutated = $orig.Replace($m.from, $m.to)
  if ($mutated -eq $orig) {
    Write-Output ("{0,-16} : NOT APPLIED (anchor drifted)" -f $m.n)
    $survived += 1
    continue
  }
  $backup = "$target.mut"
  Copy-Item $target $backup -Force
  try {
    Set-Content -Path $target -Value $mutated -NoNewline
    & $node $suite *> $null
    $code = $LASTEXITCODE
  } finally {
    Move-Item $backup $target -Force
  }
  if ($code -ne 0) {
    Write-Output ("{0,-16} : KILLED" -f $m.n)
  } else {
    Write-Output ("{0,-16} : SURVIVED (weak test)" -f $m.n)
    $survived += 1
  }
}

Write-Output '--- restored, re-running clean ---'
& $node $suite
$clean = $LASTEXITCODE
Write-Output "clean=$clean, survived=$survived"
if ($clean -ne 0 -or $survived -ne 0) { exit 1 }
