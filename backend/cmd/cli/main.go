package main

import (
	"bufio"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
)

func input(prompt string) string{
	fmt.Print(prompt)

	reader := bufio.NewReader(os.Stdin)
	text, _ := reader.ReadString('\n')
	return strings.TrimSpace(text)
}


func main() {
	url := input("Url: ")
	body := input("Body: ")

	res, err := http.Post(url, "application/json", strings.NewReader(body))

	if err != nil {
		os.Stdout.WriteString("Error " + err.Error() + "\n")
		return
	
	} else {
		defer res.Body.Close()
	}

	data, _ := io.ReadAll(res.Body)
	os.Stdout.WriteString(res.Status + "\n")
	os.Stdout.Write(data)
}
