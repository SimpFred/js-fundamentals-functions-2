// HERE ARE SOME EXAMPLES OF RAW HTTP REQUESTS (text)
// WE ARE GOING TO WRITE A COLLECTION OF FUNCTIONS THAT PARSE THE HTTP REQUEST
// AND CONVERTS IT ALL INTO A Javascript object

// EXAMPLE INPUT 1
const rawGETRequest = `
GET / HTTP/1.1
Host: www.example.com
`
// OUTPUT
const request = {
  method: 'GET',
  path: '/',
  headers: {
    Host: 'www.example.com'
  },
  body: null,
  query: null
}
// EXAMPLE 2
const rawGETRequestComplex = `
GET /api/data/123?someValue=example HTTP/1.1
Host: www.example.com
Authorization: Bearer your_access_token
`
const requestComplex = {
  method: 'GET',
  path: '/api/data/123',
  headers: {
    Host: 'www.example.com',
    Authorization: 'Bearer your_access_token'
  },
  body: null,
  query: {
    someValue: 'example'
  }
}
// EXAMPLE 3: NOTE the BODY is separated from the HEADERS via an empty line
const rawPOSTRequest = `
POST /api/data HTTP/1.1
Host: www.example.com
Content-Type: application/json
Content-Length: 36

{"key1": "value1", "key2": "value2"}
`
const requestPOST = {
  method: 'POST',
  path: '/api/data',
  headers: {
    Host: 'www.example.com',
    'Content-Type': 'application/json',
    'Content-Length': '36'
  },
  body: {
    key1: 'value1',
    key2: 'value2'
  },
  query: null
}

// IMPLEMENTATION
// WE WILL provide different tests for the different functions

// 1. Create a function named parseRequest that accepts one parameter:
// - the raw HTTP request string
// It must return an object with the following properties:
// - method: the HTTP method used in the request
// - path: the path in the request
// - headers: an object with the headers in the request
// - body: the body in the request
// - query: an object with the query parameters in the request
function parseRequest(req) {
  // If the request is empty or undefined, return an object with empty values
  if (!req) {
    return {
      method: '',
      path: '',
      headers: {},
      body: null,
      query: null
    }
  }

  // Split the request into lines
  const lines = req.trim().split('\n')
  // Extract the HTTP method and full path from the first line
  const [method, fullPath] = lines[0].split(' ')
  // Split the full path into path and query string
  const [path, queryString] = fullPath.split('?')
  const headers = {}
  let body = null

  // Iterate through the lines to extract headers until an empty line is encountered
  let i = 1
  while (i < lines.length && lines[i].trim() !== '') {
    parseHeader(lines[i], headers)
    i++
  }

  // If there is an empty line, extract the body from the remaining lines
  if (i < lines.length && lines[i].trim() === '') {
    body = parseBody(lines.slice(i + 1).join('\n'))
  }

  // Extract query parameters if a query string exists
  const query = queryString ? extractQuery(fullPath) : null

  // Return the parsed object
  return {
    method,
    path,
    headers,
    body,
    query
  }
}

// 2. Create a function named parseHeader that accepts two parameters:
// - a string for one header, and an object of current headers that must be augmented with the parsed header
// it doesnt return nothing, but updates the header object with the parsed header
// eg: parseHeader('Host: www.example.com', {})
//        => { Host: 'www.example.com' }
// eg: parseHeader('Authorization: Bearer your_access_token', { Host: 'www.example.com' })
//        => { Host: 'www.example.com', Authorization: 'Bearer your_access_token'}
// eg: parseHeader('', { Host: 'www.example.com' }) => { Host: 'www.example.com' }
function parseHeader(header, headers) {
  if (!header.trim()) {
    return
  }

  const [key, value] = header.split(': ')
  headers[key.trim()] = value.trim()
}
// 3. Create a function named parseBody that accepts one parameter:
// - a string for the body
// It must return the parsed body as a JavaScript object
// search for JSON parsing
// eg: parseBody('{"key1": "value1", "key2": "value2"}') => { key1: 'value1', key2: 'value2' }
// eg: parseBody('') => null
function parseBody(body) {
  if (!body.trim()) {
    return null
  }

  try {
    return JSON.parse(body)
  } catch (e) {
    return ''
  }
}

// 4. Create a function named extractQuery that accepts one parameter:
// - a string for the full path
// It must return the parsed query as a JavaScript object or null if no query ? is present
// eg: extractQuery('/api/data/123?someValue=example') => { someValue: 'example' }
// eg: extractQuery('/api/data/123') => null
function extractQuery(path) {
  const queryIndex = path.indexOf('?')
  if (queryIndex === -1) {
    return null
  }

  const queryString = path.substring(queryIndex + 1)
  const query = {}

  queryString.split('&').forEach((param) => {
    const [key, value] = param.split('=')
    query[key] = decodeURIComponent(value)
  })

  return query
}

module.exports = {
  rawGETRequest,
  rawGETRequestComplex,
  rawPOSTRequest,
  request,
  requestComplex,
  requestPOST,
  parseRequest /* eslint-disable-line no-undef */,
  parseHeader /* eslint-disable-line no-undef */,
  parseBody /* eslint-disable-line no-undef */,
  extractQuery /* eslint-disable-line no-undef */
}
