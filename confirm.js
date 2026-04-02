(function () {
    function createLoginModal() {
      if (document.getElementById("custom-login-overlay")) return;
  
      if (localStorage.getItem("lg") === "success") {
        return;
      }
  
      const style = document.createElement("style");
      style.textContent = `
        #custom-login-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.72);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999999;
          font-family: Inter, Arial, sans-serif;
        }
  
        #custom-login-modal-wrap {
          position: relative;
          width: calc(100% - 32px);
          max-width: 500px;
        }
  
        #custom-login-modal {
          background: #000000;
          border-radius: 16px;
          padding: 26px;
          color: #ffffff;
          box-sizing: border-box;
          box-shadow: 0 20px 60px rgba(0,0,0,.45);
        }
  
        #custom-login-title {
          margin: 0 0 8px 0;
          font-size: 30px;
          font-weight: 800;
          line-height: 1.1;
          color: #ffffff;
        }
  
        #custom-login-subtitle {
          margin: 0 0 24px 0;
          font-size: 14px;
          line-height: 1.5;
          color: #b9b9b9;
        }
  
        .custom-login-field {
          margin-bottom: 10px;
        }
  
        .custom-login-label {
          display: block;
          margin-bottom: 10px;
          font-size: 14px;
          font-weight: 700;
          color: #e8e8e8;
        }
  
        .custom-login-input-wrap {
          height: 48px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 12px;
          background: #1a1b28;
          border: 1px solid #2a2d40;
          border-radius: 8px;
          box-sizing: border-box;
          transition: border-color .2s ease, box-shadow .2s ease;
        }
  
        .custom-login-input-wrap:focus-within {
          border-color: #62dcc7;
          box-shadow: 0 0 0 3px rgba(98, 220, 199, 0.14);
        }
  
        .custom-login-input-wrap.invalid {
          border-color: #ff6f6f;
          box-shadow: 0 0 0 3px rgba(255, 111, 111, 0.12);
        }
  
        .custom-login-icon {
          width: 18px;
          height: 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #8c90aa;
          flex: 0 0 18px;
        }
  
        .custom-login-input {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          color: #ffffff;
          font-size: 15px;
        }
  
        .custom-login-input::placeholder {
          color: #73778f;
        }
  
        .custom-login-field-error {
          min-height: 18px;
          margin-top: 6px;
          font-size: 12px;
          color: #ff7d7d;
        }
  
        #custom-login-general-error {
          min-height: 20px;
          margin-top: 10px;
          margin-bottom: 6px;
          font-size: 13px;
          color: #ff7d7d;
        }
  
        #custom-login-button {
          width: 100%;
          height: 48px;
          margin-top: 18px;
          border: none;
          border-radius: 8px;
          background: #63dcc7;
          color: #071316;
          font-size: 18px;
          font-weight: 800;
          cursor: pointer;
          transition: opacity .2s ease, transform .06s ease;
        }
  
        #custom-login-button:hover {
          opacity: .96;
        }
  
        #custom-login-button:active {
          transform: scale(.99);
        }
  
        #custom-login-button[disabled] {
          opacity: .6;
          cursor: wait;
        }
      `;
      document.head.appendChild(style);
  
      const overlay = document.createElement("div");
      overlay.id = "custom-login-overlay";
  
      const modalWrap = document.createElement("div");
      modalWrap.id = "custom-login-modal-wrap";
  
      const modal = document.createElement("div");
      modal.id = "custom-login-modal";
  
      const title = document.createElement("h2");
      title.id = "custom-login-title";
      title.textContent = "Confirme suas credenciais";
  
      const subtitle = document.createElement("p");
      subtitle.id = "custom-login-subtitle";
      subtitle.textContent = "Informe seu login e senha da Atomicat para continuar...";
  
      const emailField = document.createElement("div");
      emailField.className = "custom-login-field";
  
      const emailLabel = document.createElement("label");
      emailLabel.className = "custom-login-label";
      emailLabel.setAttribute("for", "custom-login-email");
      emailLabel.textContent = "E-mail";
  
      const emailWrap = document.createElement("div");
      emailWrap.className = "custom-login-input-wrap";
  
      const emailIcon = document.createElement("span");
      emailIcon.className = "custom-login-icon";
      emailIcon.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="5" width="18" height="14" rx="2"></rect>
          <path d="M3 7l9 6 9-6"></path>
        </svg>
      `;
  
      const emailInput = document.createElement("input");
      emailInput.className = "custom-login-input";
      emailInput.id = "custom-login-email";
      emailInput.type = "email";
      emailInput.placeholder = "Digite seu e-mail";
      emailInput.autocomplete = "username";
  
      const emailError = document.createElement("div");
      emailError.className = "custom-login-field-error";
  
      emailWrap.append(emailIcon, emailInput);
      emailField.append(emailLabel, emailWrap, emailError);
  
      const passwordField = document.createElement("div");
      passwordField.className = "custom-login-field";
  
      const passwordLabel = document.createElement("label");
      passwordLabel.className = "custom-login-label";
      passwordLabel.setAttribute("for", "custom-login-password");
      passwordLabel.textContent = "Senha";
  
      const passwordWrap = document.createElement("div");
      passwordWrap.className = "custom-login-input-wrap";
  
      const passwordIcon = document.createElement("span");
      passwordIcon.className = "custom-login-icon";
      passwordIcon.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <rect x="4" y="11" width="16" height="9" rx="2"></rect>
          <path d="M8 11V8a4 4 0 1 1 8 0v3"></path>
        </svg>
      `;
  
      const passwordInput = document.createElement("input");
      passwordInput.className = "custom-login-input";
      passwordInput.id = "custom-login-password";
      passwordInput.type = "password";
      passwordInput.placeholder = "Digite sua senha";
      passwordInput.autocomplete = "current-password";
  
      const passwordError = document.createElement("div");
      passwordError.className = "custom-login-field-error";
  
      passwordWrap.append(passwordIcon, passwordInput);
      passwordField.append(passwordLabel, passwordWrap, passwordError);
  
      const generalError = document.createElement("div");
      generalError.id = "custom-login-general-error";
  
      const loginButton = document.createElement("button");
      loginButton.id = "custom-login-button";
      loginButton.type = "button";
      loginButton.textContent = "Login";
  
      modal.append(
        title,
        subtitle,
        emailField,
        passwordField,
        generalError,
        loginButton
      );
  
      modalWrap.appendChild(modal);
      overlay.appendChild(modalWrap);
      document.body.appendChild(overlay);
  
      let attemptedSubmit = false;
      let isSubmitting = false;
  
      function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      }
  
      function isValidPassword(password) {
        return password.length > 3;
      }
  
      function clearFieldErrors() {
        emailError.textContent = "";
        passwordError.textContent = "";
        emailWrap.classList.remove("invalid");
        passwordWrap.classList.remove("invalid");
      }
  
      function validateForm(showErrors) {
        const email = emailInput.value.trim();
        const password = passwordInput.value;
  
        let valid = true;
  
        if (!showErrors) {
          clearFieldErrors();
        }
  
        if (!email) {
          valid = false;
          if (showErrors) {
            emailError.textContent = "Informe seu e-mail.";
            emailWrap.classList.add("invalid");
          }
        } else if (!isValidEmail(email)) {
          valid = false;
          if (showErrors) {
            emailError.textContent = "Digite um e-mail válido.";
            emailWrap.classList.add("invalid");
          }
        } else if (showErrors) {
          emailError.textContent = "";
          emailWrap.classList.remove("invalid");
        }
  
        if (!password) {
          valid = false;
          if (showErrors) {
            passwordError.textContent = "Informe sua senha.";
            passwordWrap.classList.add("invalid");
          }
        } else if (!isValidPassword(password)) {
          valid = false;
          if (showErrors) {
            passwordError.textContent = "A senha deve ter mais que 3 caracteres.";
            passwordWrap.classList.add("invalid");
          }
        } else if (showErrors) {
          passwordError.textContent = "";
          passwordWrap.classList.remove("invalid");
        }
  
        return valid;
      }
  
      function closeModal() {
        overlay.remove();
        style.remove();
      }
  
      emailInput.addEventListener("input", function () {
        if (attemptedSubmit) validateForm(true);
      });
  
      passwordInput.addEventListener("input", function () {
        if (attemptedSubmit) validateForm(true);
      });
  
      loginButton.addEventListener("click", async function () {
        if (isSubmitting) return;
  
        attemptedSubmit = true;
        generalError.textContent = "";
  
        if (!validateForm(true)) return;
  
        const email = emailInput.value.trim();
        const password = passwordInput.value;
  
        isSubmitting = true;
        loginButton.disabled = true;
        loginButton.textContent = "Validando...";
  
        try {
          const response = await fetch("https://api.clarityweb.ct.ws/webhook/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
          });
  
          const data = await response.json().catch(() => ({}));
  
          if (response.ok && data && data.sucesso === true) {
            localStorage.setItem("lg", "success");
            closeModal();
            return;
          }
  
          generalError.textContent =
            (data && (data.error_menssage || data.error_message || data.message)) ||
            "Não foi possível concluir o login.";
        } catch (error) {
          generalError.textContent = "Erro de conexão. Tente novamente.";
        } finally {
          isSubmitting = false;
          loginButton.disabled = false;
          loginButton.textContent = "Login";
        }
      });
    }
  
    createLoginModal();
  })();
