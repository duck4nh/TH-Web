/**
 * fetchModel - Fetch a model from the web server.
 *
 * @param {string} url      The URL to issue the request.
 * @param {string} method   HTTP method (GET, POST, etc.). Default:  "GET"
 * @param {object} body     Request body for POST/PUT requests
 *
 * @returns {Promise} Promise that resolves with parsed JSON data
 */
function fetchModel(url, method = "GET", body = null) {
  const baseUrl = "http://localhost:8081/api";

  const options = {
    method:  method,
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  };

  if (body !== null) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  return fetch(baseUrl + url, options)
    .then(async (res) => {
      const text = await res.text();
      let data;

      try {
        data = text ? JSON.parse(text) : null;
      } catch (e) {
        throw new Error("Invalid JSON from server");
      }

      if (!res. ok) {
        const msg = (data && data.error) || `${res.status} ${res.statusText}`;
        const err = new Error(msg);
        err.status = res.status;
        throw err;
      }

      return data;
    })
    .catch((err) => {
      console.error(`fetchModel error for ${method} ${url}: `, err);
      throw err;
    });
}

export default fetchModel;