import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { LOGIN } from "../queries";

const Login = ({ show, setToken }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [login, result] = useMutation(LOGIN, {
    onError: (error) => {
      console.log(error.graphQLErrors[0].message);
    },
  });

  useEffect(() => {
    if (result.data) {
      console.log("Got result data", result.data);
      const token = result.data.login.value;
      console.log("Setting token");
      setToken(token);
      localStorage.setItem("library-user-token", token);
    }
  }, [result.data]); // eslint-disable-line

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Logging in with: ", username, password);
    login({ variables: { username, password } });
  };

  if (!show) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        username
        <input
          type={"text"}
          value={username}
          onChange={({ target }) => setUsername(target.value)}
        />
      </div>
      <div>
        password
        <input
          type={"password"}
          value={password}
          onChange={({ target }) => setPassword(target.value)}
        />
      </div>
      <div>
        <button>login</button>
      </div>
    </form>
  );
};

export default Login;
