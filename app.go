package main

import (
	"context"
	"fmt"
	"io"
	"io/fs"
	"net/http"
	"os"
	"os/exec"
	"os/user"
	"path/filepath"
	"strings"
	"syscall"

	"github.com/go-toast/toast"
	"github.com/hpcloud/tail"
	"github.com/lxn/win"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx  context.Context
	mode string
}

// NewApp creates a new App application struct
func NewApp(mode string) *App {
	return &App{
		mode: mode,
	}
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

func (a *App) GetMode() string {
	return a.mode
}

func (a *App) OpenSelf(mode string) error {
	path, _ := os.Executable()

	var cmd string
	var args []string
	cmd = path
	args = []string{"-mode", mode}
	return exec.Command(cmd, args...).Start()
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
	r, _ := a.FileExists(path)
	if !r {
		os.Create(path)
	}
	return os.WriteFile(path, []byte(context), 777)
}

func (a *App) FileExists(path string) (bool, error) {
	_, err := os.Stat(path)
	if err == nil {
		return true, nil
	}
	if os.IsNotExist(err) {
		return false, nil
	}
	return true, err
}

var lastLine string

func (a *App) MonitorFile(path string) string {
	seek := &tail.SeekInfo{}
	seek.Offset = 0
	seek.Whence = io.SeekEnd
	config := tail.Config{}
	config.Follow = true
	config.Location = seek
	config.ReOpen = true
	config.MustExist = false
	config.Poll = true
	t, err := tail.TailFile(path, config)
	if err != nil {
		return err.Error()
	}
	go func() {
		for {
			line := <-t.Lines
			if lastLine == line.Text {
				continue
			}
			lastLine = line.Text
			fmt.Println(line.Text)
			runtime.EventsEmit(a.ctx, "tail_line", line.Text)
		}
	}()
	return ""
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
			return u.HomeDir + "\\AppData\\Roaming\\Starburst Overlay.exe\\"
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

func (a *App) ShowNotification(title string, content string, actions []toast.Action) string {
	notification := toast.Notification{
		AppID:   "Starburst Overlay",
		Title:   title,
		Message: content,
		Icon:    a.GetPath("this") + "icon.ico",
		Actions: actions,
	}
	err := notification.Push()
	if err != nil {
		return err.Error()
	}
	return ""
}

type ResponseBody struct {
	Body    string
	Status  int
	Headers http.Header
}

func (a *App) Fetch(url string) (ResponseBody, error) {
	response, err := http.Get(url)
	if err != nil {
		return ResponseBody{
			Body:   "",
			Status: 0,
		}, err
	}
	defer response.Body.Close()
	bytes, _ := io.ReadAll(response.Body)
	return ResponseBody{
		Body:    string(bytes),
		Status:  response.StatusCode,
		Headers: response.Header,
	}, err
}

func (a *App) OpenFileDialog(title string, filePattern string) (string, error) {
	options := runtime.OpenDialogOptions{}
	options.Title = title
	options.Filters = []runtime.FileFilter{
		{
			DisplayName: filePattern,
			Pattern:     filePattern,
		},
	}
	path, err := runtime.OpenFileDialog(a.ctx, options)
	fmt.Println(path)
	return path, err
}

func (a *App) OpenExternal(url string) error {
	var cmd string
	var args []string

	cmd = "cmd"
	args = []string{"/c", "start"}

	args = append(args, url)
	return exec.Command(cmd, args...).Start()
}
