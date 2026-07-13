console.log("AUTH JS LOADED");

document.addEventListener("DOMContentLoaded", () => {

  // LOGIN
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        const res = await api.login(email, password);

      localStorage.setItem("token", res.token);
      alert("Login successful");
      window.location.href = "dashboard.html";

      } catch (err) {
        alert(err.message);
      }
    });
  }


  // SIGNUP
  const signupForm = document.getElementById("signupForm");

  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        await api.register({
          name,
          email,
          password
        });

        alert("Signup successful");
        window.location.href = "login.html";

      } catch (err) {
        alert(err.message);
      }
    });
  }

});