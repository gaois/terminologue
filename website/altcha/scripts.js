window.addEventListener("load", () => {
  const widget = document.querySelector('altcha-widget');
  widget.addEventListener('verified', (ev) => {
    window.location = returnUrl;
  });
});