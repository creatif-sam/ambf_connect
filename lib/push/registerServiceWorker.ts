export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/"
    })

    console.log("Service worker registered:", registration)
  } catch (err) {
    console.error("Service worker registration failed:", err)
  }
}
