const apiKey = "AIzaSyBZWVpAfxi3N1gGIsD4uvks5S0lS9mNwy8";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function check() {
  const res = await fetch(url);
  const data = await res.json();
  if (data.models) {
    console.log("✅ Modelos disponibles para tu llave:");
    data.models.forEach(m => console.log(`- ${m.name}`));
  } else {
    console.log("❌ Error:", data);
  }
}
check();