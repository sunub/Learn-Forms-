import Dialog from "./Dialog"

export const Button = () => {

  window.addEventListener("keydown", event => {
    const dialog = document.querySelector(".MegaDialog")
    if (event.key === "Escape") {
      dialog?.removeAttribute("open")
      dialog?.setAttribute("inert", "")
    }
  })

  return <>
    <div className="button-container">
      <button className="custom-button" onClick={() => {
        const dialog = document.querySelector(".MegaDialog")
        if (dialog?.hasAttribute("inert")) {
          dialog.removeAttribute("inert")
          document.querySelector(".MegaDialog")?.setAttribute("open", "")
        } else {
          document.querySelector(".MegaDialog")?.setAttribute("open", "")
        }
      }}>CLICK ME!</button>
    </div>
  </>
}