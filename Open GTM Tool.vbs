Option Explicit

Dim shell, fso, projectDir, nodePath, command, probe

Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

projectDir = fso.GetParentFolderName(WScript.ScriptFullName)
nodePath = shell.ExpandEnvironmentStrings("%USERPROFILE%") & "\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"

If Not fso.FileExists(nodePath) Then
  MsgBox "Node.js was not found. Open Codex first so the bundled runtime is available, or install Node.js.", vbExclamation, "GTM Tool"
  WScript.Quit 1
End If

probe = "powershell.exe -NoProfile -ExecutionPolicy Bypass -Command " & _
  """try { (Invoke-WebRequest -Uri 'http://127.0.0.1:8787/' -UseBasicParsing -TimeoutSec 2) | Out-Null; exit 0 } catch { exit 1 }"""

If shell.Run(probe, 0, True) <> 0 Then
  command = "cmd.exe /c cd /d """ & projectDir & """ && """ & nodePath & """ server\server.js"
  shell.Run command, 0, False
  WScript.Sleep 2000
End If

shell.Run "powershell.exe -NoProfile -ExecutionPolicy Bypass -Command ""Start-Process 'http://127.0.0.1:8787/'""", 0, False
