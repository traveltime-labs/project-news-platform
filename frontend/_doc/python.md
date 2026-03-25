

## 安裝python版本管理器

用 pyenv-win

👉 類似 Node 的 nvm，可以切換 Python 版本
👉 適合你之後開發（特別是你有在寫後端）


### Step 1：安裝 pyenv-win
方法（最簡單）

打開 PowerShell（用系統管理員）：

```
git clone https://github.com/pyenv-win/pyenv-win.git $env:USERPROFILE\.pyenv
```

### Step 2：設定環境變數（很重要）

安裝後，手動確認有這兩個路徑：

```
C:\Users\你的帳號\.pyenv\pyenv-win\bin
C:\Users\你的帳號\.pyenv\pyenv-win\shims
```
👉 加到系統的 PATH


#### 環境變數設定

開啟powershell

請在你的 PowerShell 中，依序執行以下這三行指令（這會自動幫你把變數寫入 Windows 設定）：
```
[System.Environment]::SetEnvironmentVariable('PYENV', "$env:USERPROFILE\.pyenv\pyenv-win\", 'User')
[System.Environment]::SetEnvironmentVariable('PYENV_ROOT', "$env:USERPROFILE\.pyenv\pyenv-win\", 'User')
[System.Environment]::SetEnvironmentVariable('PYENV_HOME', "$env:USERPROFILE\.pyenv\pyenv-win\", 'User')
```

接著設定 PATH
```
[System.Environment]::SetEnvironmentVariable('path', $env:USERPROFILE + "\.pyenv\pyenv-win\bin;" + $env:USERPROFILE + "\.pyenv\pyenv-win\shims;" + [System.Environment]::GetEnvironmentVariable('path', 'User'), 'User')
```

重啟 PowerShell


### Step 3：重開 PowerShell，測試
```
pyenv --version
```

有版本號代表成功 🎉

### Step 4：安裝 Python

查看可用版本：
```
pyenv install -l
```

安裝一個版本（例如 3.11）：
```
pyenv install 3.11.9
```
### Step 5：切換版本

全域版本：
```
pyenv global 3.11.9
```
專案版本（推薦）：

```
pyenv local 3.11.9
```
👉 會在資料夾產生 .python-version

### Step 6：確認 Python
```
python --version
```


## 開啟虛擬機

```
python -m venv .venv
```
```
.\.venv\Scripts\Activate.ps1
```

### 第一次使用安裝套件

```
pip install -r requirements.txt
```

### 離開 vevn

```
deactivate
```


## 本地端模擬


### 初始化

pip install python-dotenv

如果剛建立googlesheet
```
python setup_sheets.py
```


### 執行爬蟲
python main.py





