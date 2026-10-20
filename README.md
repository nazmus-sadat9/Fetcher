# Fetcher

A Postman-like API client with a web app and a CLI. Send requests, save them in collections, and run them from your browser or terminal.


## Usage

1. **Add a base URL.** On the right side, type your API's address (like `http://localhost:8080`) and hit Add. You can save as many as you want and click one to make it active. The ✕ removes it.

2. **Pick a method.** Use the dropdown next to the URL bar: GET, POST, PUT, DELETE, whatever your endpoint needs.

3. **Type the path.** Just the part after the base URL, like `/` or `/users`.

4. **Add a body (if you need one).** For POST, PUT and the like, write your JSON in the box below:

   {
     "username": "name"
   }

5. **Hit Send.** The response shows up in the box underneath. Until you send something, it just says "Response will show here".

### Testing a local server

If your backend runs on your own machine, add `http://localhost:PORT` as a base URL. Your server needs CORS enabled, otherwise the browser will block the request even though the server is fine.
