<div align="center">

# 🎵 SpotiMeow 🐾

<img src="frontend/public/icon.png" alt="SpotiMeow Logo" width="120" height="120">

### *High-Quality Music Downloader*

**🚀 Get Spotify tracks in true FLAC quality from Tidal, Qobuz & Amazon Music — no account required! 🚀**
</div>

## 📋 What is SpotiMeow?

<div align="center">

> **🎶 *Transform your music experience with lossless audio quality* 🎶**

</div>

SpotiMeow is a **powerful desktop application** that allows you to download high-quality FLAC audio files from multiple streaming platforms. Simply paste a Spotify track, album, or playlist URL, and SpotiMeow will find the same content on Tidal, Qobuz, or Amazon Music and download it in **lossless FLAC format**.

<br>

<div align="center">

### ✨ **Key Features** ✨

| Feature | Description |
|:-------:|:------------|
| 🎵 **High-Quality Audio** | Download tracks in **lossless FLAC format** |
| 🔗 **Multiple Sources** | Fetches from **Tidal**, **Qobuz**, and **Amazon Music** |
| 📱 **No Accounts Required** | No need to sign up for streaming services |
| 🎨 **User-Friendly Interface** | Modern, intuitive design built with **React** and **Tailwind** |
| ⚡ **Fast Downloads** | Efficient downloading with **real-time progress tracking** |
| 📁 **Smart Organization** | Automatically organizes files with **proper metadata** |

</div>

<br>

<div align="center">

---

### 🌟 **Why Choose SpotiMeow?** 🌟

*Experience music the way it was meant to be heard - in crystal-clear, lossless quality!*

---

</div>

## 🚀 **Quick Start Guide**

<div align="center">

*Choose your adventure! Two paths to musical paradise* 🎵

</div>

### 🎯 **Option 1: Download Pre-built Release** *(Easiest)*

<details>
<summary><b>📥 Click here for instant setup!</b></summary>

<br>

1. 🌐 **Visit** the [**Releases page**](https://github.com/afkarxyz/SpotiFLAC/releases)
2. 💾 **Download** the latest `.exe` file for Windows
3. 🚀 **Run** the downloaded file
4. 🖥️ **Create desktop shortcut** by right-clicking the app → *"Create shortcut"*

**⭐ That's it! You're ready to download high-quality music!**

</details>

---

### 🛠️ **Option 2: Build from Source** *(For Developers)*

<details>
<summary><b>🔨 Click here for the complete build guide!</b></summary>

<br>

> **📚 Follow these step-by-step instructions to set up and run SpotiMeow on your computer**

<br>

## 📋 **Prerequisites**

<div align="center">

*Before you begin, make sure you have these tools installed:*

</div>

<br>

### 🔧 **1. Install Go Programming Language**

| Step | Action |
|:----:|:-------|
| 🌐 | Visit [**golang.org/dl/**](https://golang.org/dl/) |
| 💾 | Download the installer for your operating system |
| 🚀 | Run the installer and follow the setup wizard |
| ✅ | Verify by typing: `go version` |

```bash
# Verify installation
go version
```

<br>

### 📦 **2. Install Node.js and pnpm**

| Step | Action |
|:----:|:-------|
| 🌐 | Visit [**nodejs.org**](https://nodejs.org/) |
| 💾 | Download and install the **LTS version** |
| 📦 | Install pnpm: `npm install -g pnpm` |
| ✅ | Verify installation |

```bash
# Install pnpm
npm install -g pnpm

# Verify installations
node --version
pnpm --version
```

<br>

### ⚡ **3. Install Wails Framework**

| Step | Action |
|:----:|:-------|
| 🔑 | Open **Command Prompt/Terminal as Administrator** |
| 📦 | Install Wails framework |
| ✅ | Verify installation |

```bash
# Install Wails
go install github.com/wailsapp/wails/v2/cmd/wails@latest

# Verify installation
wails version
```

<br>

---

## 📦 **Installation Steps**

### 🔽 **Step 1: Download the Source Code**

<div align="center">

*Choose your preferred method:*

</div>

<br>

#### 🐙 **Option A - Using Git** *(Recommended)*
```bash
git clone https://github.com/afkarxyz/SpotiFLAC.git
cd SpotiFLAC
```

#### 📁 **Option B - Download ZIP**
- 🌐 Go to the **repository page**
- 📥 Click **"Code"** → **"Download ZIP"**
- 📂 Extract the ZIP file to your desired location
- 💻 Open Command Prompt/Terminal in that folder

<br>

### 🔧 **Step 2: Install Dependencies**

```bash
# Navigate to project folder and install dependencies
pnpm install
```

> 🎉 **Great! All dependencies are now installed!**

<br>

---

## 🛠️ **Running the Application**

<div align="center">

### 🎯 **Choose Your Mode**

</div>

<br>

### 🚧 **Development Mode** *(For Testing/Development)*

```bash
# Run with hot-reload
wails dev
```

> ✨ **Features:**
> - 🔄 **Automatic reload** when you make changes
> - 🐛 **Perfect for testing** and development
> - 🚀 **Instant feedback** on your modifications

<br>

### 🏭 **Production Build** *(Create Executable)*

#### **🔨 Build the Application:**
```bash
wails build
```

#### **📁 Find Your Executable:**

| Platform | Location |
|:--------:|:---------|
| 🪟 **Windows** | `build/bin/SpotiMeow.exe` |
| 🍎 **macOS** | `build/bin/SpotiMeow.app` |
| 🐧 **Linux** | `build/bin/SpotiMeow` |

<br>

#### **🖥️ Create Desktop Shortcuts:**

<details>
<summary><b>Windows 🪟</b></summary>

1. Right-click on `SpotiMeow.exe`
2. Select **"Create shortcut"**
3. Move the shortcut to your **Desktop**
4. *Optional:* Rename it to **"SpotiMeow"**

</details>

<details>
<summary><b>macOS 🍎</b></summary>

1. Drag `SpotiMeow.app` to your **Applications** folder
2. Right-click and select **"Make Alias"**
3. Move the alias to your **Desktop**

</details>

<details>
<summary><b>Linux 🐧</b></summary>

1. Copy the executable to `/usr/local/bin/` *(optional)*
2. Create a `.desktop` file in `~/.local/share/applications/`

</details>

</details>

---

<div align="center">

## 🎯 **How to Use SpotiMeow**

*Simple steps to musical bliss* 🎵✨

</div>

<br>

<div align="center">

### 🚀 **5-Step Process**

| Step | Action | Icon |
|:----:|:-------|:----:|
| **1** | **🚀 Launch the app** by double-clicking the executable or shortcut | 🖱️ |
| **2** | **📋 Copy a Spotify URL** (track, album, or playlist) | 🔗 |
| **3** | **📥 Paste the URL** into SpotiMeow's search bar | 📝 |
| **4** | **⚙️ Select your preferred quality** and output folder | 🎛️ |
| **5** | **⬇️ Click Download** and wait for the magic to happen! | ✨ |

<br>

### 🎵 **Enjoy your high-quality FLAC files!** 🎵

*Crystal-clear audio awaits you!* 

</div>

<br>

---

<div align="center">

## 🔧 **Troubleshooting**

*Having issues? We've got you covered!* 🛠️

</div>

<br>

### 🚨 **Common Issues & Solutions:**

<details>
<summary><b>❌ "wails command not found"</b></summary>

**🔍 Solution:** Make sure Go's bin directory is in your PATH environment variable.

```bash
# Check your Go installation
go env GOPATH
```

</details>

<details>
<summary><b>❌ Build fails</b></summary>

**🔍 Solution:** Ensure all dependencies are installed correctly.

```bash
# Clean and reinstall dependencies
rm -rf node_modules
pnpm install
```

</details>

<details>
<summary><b>❌ App won't start</b></summary>

**🔍 Solution:** Check if you have the required system libraries installed.

</details>

<br>

### 🆘 **Getting Help:**

- 🔍 Check the [**Issues page**](https://github.com/afkarxyz/SpotiFLAC/issues) for known problems
- 🐛 Create a **new issue** if you encounter a bug
- 💬 Join our community discussions

<br>

---

<div align="center">

## 📸 **Screenshot**

*See SpotiMeow in action!* 🎬

![SpotiMeow Interface](https://github.com/user-attachments/assets/afe01529-bcf0-4486-8792-62af26adafee)

*Beautiful, modern interface designed for ease of use* ✨

</div>

<br>

---

<div align="center">

## 💝 **Support the Project**

*Love SpotiMeow? Show some love back!* ❤️

<br>

**If you find SpotiMeow useful, consider supporting the development:**

[![Ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/afkarxyz)

<br>

### 🌟 **Ways to Support:**
- ⭐ **Star this repository**
- 🐛 **Report bugs** and suggest features
- 💬 **Share** with your friends
- ☕ **Buy us a coffee** via Ko-fi

</div>

<br>

---

<div align="center">

### 🎵✨ **Enjoy your high-quality music downloads with SpotiMeow!** ✨🎵

*Transform your music library today!* 🚀

<br>

**Made with ❤️ for music lovers everywhere** 🌍

---

*© 2025 SpotiMeow - Bringing you closer to perfect sound quality* 🎶

</div>
