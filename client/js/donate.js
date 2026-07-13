document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("donateForm");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const amount = parseFloat(document.getElementById("amount").value);
    const currency = document.getElementById("currency").value;
    const gateway = document.getElementById("gateway").value;

    if (!name || !email || !amount || amount < 1) {
      alert("Please enter your name, email, and a valid donation amount.");
      return;
    }

    try {
      const response = await api.createDonation({
        name,
        email,
        amount,
        currency,
        gateway,
      });

      if (response?.paymentUrl) {
        const message = gateway === "transfer"
          ? "Donation received. You will be contacted with transfer details shortly."
          : "Donation initiated. Redirecting to payment...";
        alert(message);
        window.location.href = response.paymentUrl;
      } else {
        alert("Donation recorded successfully.");
      }
    } catch (err) {
      alert(err.message || "Donation failed. Please try again.");
    }
  });
});