export function setDialogStatus(status: string) {
    const dialogDOM = document.querySelector(".MegaDialog") as HTMLDialogElement
    if (status === "showModal") {
        dialogDOM.showModal()
    }

    if (status === "close-dialog") {
        dialogDOM.close()
    }
}
