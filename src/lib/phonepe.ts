export const loadPhonePeScript = (isProd: boolean) => {
  return new Promise((resolve) => {
    const existingScript = document.getElementById("phonepe-checkout-sdk");
    if (existingScript) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.id = "phonepe-checkout-sdk";
    script.src = isProd
      ? "https://mercury.phonepe.com/web/bundle/checkout.js"
      : "https://mercury-stg.phonepe.com/web/bundle/checkout.js";

    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };

    document.body.appendChild(script);
  });
};
