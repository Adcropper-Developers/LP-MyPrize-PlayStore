import s from "./helpers.js";
class MobileUI {
    constructor() {
        this.modal = document.getElementById("mobile-scroll-modal"),
        this.stickyFooter = document.getElementById("mobile-sticky-footer"),
        this.modalCloseBtn = this.modal?.querySelector(".modal-close-btn"),
        this.modalShown = !1,
        this.footerShown = !1,
        this.lastScrollPosition = 0,
        this.scrollThreshold = 300,
        this.scrollDirection = "down",
        this.modalDismissed = !1,
        this.handleScroll = this.handleScroll.bind(this),
        this.closeModal = this.closeModal.bind(this),
        this.init()
    }
    init() {
        if (!this.modal || !this.stickyFooter || !this.modalCloseBtn) {
            console.warn("Required elements not found in the DOM");
            return
        }
        s.isMobile.value && this.addEventListeners(),
        s.isMobile.subscribe(s => {
            s ? this.addEventListeners() : (this.removeEventListeners(),
            this.hideAll())
        }
        )
    }
    addEventListeners() {
        window.addEventListener("scroll", this.handleScroll),
        this.modalCloseBtn.addEventListener("click", this.closeModal)
    }
    removeEventListeners() {
        window.removeEventListener("scroll", this.handleScroll),
        this.modalCloseBtn.removeEventListener("click", this.closeModal)
    }
    handleScroll() {
        let s = window.scrollY;
        this.scrollDirection = s > this.lastScrollPosition ? "down" : "up",
        "down" === this.scrollDirection ? (this.modalShown || this.modalDismissed || !(s > this.scrollThreshold) || this.showModal(),
        this.showStickyFooter()) : this.hideStickyFooter(),
        this.lastScrollPosition = s
    }
    showModal() {
        this.modalShown || this.modalDismissed || (document.body.style.overflow = "hidden",
        this.modal.style.display = "flex",
        this.modal.offsetHeight,
        this.modal.classList.add("show"),
        this.modalShown = !0)
    }
    hideModal() {
        this.modalShown && (document.body.style.overflow = "",
        this.modal.classList.remove("show"),
        this.modalShown = !1,
        setTimeout( () => {
            this.modalShown || (this.modal.style.display = "none")
        }
        , 300))
    }
    closeModal() {
        this.modalDismissed = !0,
        this.hideModal()
    }
    showStickyFooter() {
        this.footerShown || (this.stickyFooter.style.display = "block",
        this.stickyFooter.offsetHeight,
        this.stickyFooter.classList.add("show"),
        this.footerShown = !0)
    }
    hideStickyFooter() {
        this.footerShown && (this.stickyFooter.classList.remove("show"),
        this.footerShown = !1,
        setTimeout( () => {
            this.footerShown || (this.stickyFooter.style.display = "none")
        }
        , 300))
    }
    hideAll() {
        this.hideModal(),
        this.hideStickyFooter()
    }
}
let mobileUI = new MobileUI;
