package main

import (
	"context"
	"fmt"
	"io"
	"io/fs"
	"net/http"
	"os"
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

type FetchResult struct {
	body   string
	status int
}

func (a *App) Fetch(url string) (string, error) {
	response, err := http.Get(url)
	if err != nil {
		return "{\"body\":\"\",\"status\":0}", err
	}
	defer response.Body.Close()
	bytes, _ := io.ReadAll(response.Body)
	return "{\"body\":\"" + ToJsonString(strings.ReplaceAll(string(bytes), "\n", "")) + "\",\"status\":" + fmt.Sprint(response.StatusCode) + "}", err
}

func ToJsonString(s string) string {
	return strings.ReplaceAll(strings.ReplaceAll(s, "/", "\\/"), "\"", "\\\"")
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
	return path, err
}
