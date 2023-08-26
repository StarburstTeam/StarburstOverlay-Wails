package main

import (
	"context"
	"fmt"
	"io"
	"io/fs"
	"os"
	"os/user"
	"path/filepath"
	"strings"
	"syscall"
	"time"

	"github.com/lxn/win"

	"github.com/hpcloud/tail"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	var val *uint16
	var err error
	val, err = syscall.UTF16PtrFromString("Starburst Overlay")
	if err != nil {
		print(err)
	}
	hwnd := win.FindWindow(nil, val)
	win.SetWindowLong(hwnd, win.GWL_EXSTYLE, win.GetWindowLong(hwnd, win.GWL_EXSTYLE)|win.WS_EX_LAYERED)

}

func (a *App) ReadJsonString(path string) (string, error) {
	bytes, err := os.ReadFile(path)
	if err != nil {
		fmt.Print(err)
		return "{}", err
	}
	return string(bytes), err
}

func (a *App) WriteJsonString(path string, context string) error {
	return os.WriteFile(path, []byte(context), 777)
}

var newLogs []string

func (a *App) MonitorFile(path string) string {
	newLogs = []string{}
	//设置seek 到文末
	seek := &tail.SeekInfo{}
	seek.Offset = 0
	seek.Whence = io.SeekEnd
	// 设置配置
	config := tail.Config{}
	config.Follow = true
	config.Location = seek
	config.ReOpen = true
	config.MustExist = false
	config.RateLimiter.LeakInterval = time.Millisecond * 100
	t, err := tail.TailFile(path, config)
	if err != nil {
		return err.Error()
	}
	fmt.Println(111)
	go func() {
		for line := range t.Lines {
			fmt.Println(line.Text)
		}
	}()
	fmt.Println(222)
	return ""
}

func (a *App) GetLines() []string {
	var nowLogs []string
	nowLogs = newLogs
	newLogs = []string{}
	return nowLogs
}

func (a *App) GetDirectoryFiles(path string) []string {
	var jsons []string
	filepath.Walk(path, func(path string, info fs.FileInfo, err error) error {
		if strings.HasSuffix(path, ".json") {
			jsons = append(jsons, path)
		}
		return nil
	})
	return jsons
}

func (a *App) GetPath(t string) string {
	switch t {
	case "roaming":
		{
			u, err := user.Current()
			if err != nil {
				fmt.Print(err)
			}
			return u.HomeDir + "\\AppData\\Roaming\\Starburst Overlay\\"
		}
	case "this":
		{
			dir, err := os.Executable()
			if err != nil {
				fmt.Println(err)
			}
			exPath := filepath.Dir(dir)
			return exPath + "\\"
		}
	}
	u, err := user.Current()
	if err != nil {
		fmt.Print(err)
	}
	return u.HomeDir + "\\"
}
