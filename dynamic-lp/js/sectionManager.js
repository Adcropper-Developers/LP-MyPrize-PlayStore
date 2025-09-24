import windowSize from "./helpers.js";
import { DataService } from "./services/dataService.js";
import { config } from "./config.js";

class Section6Manager {
  constructor() {
    this.section = document.querySelector("#section6");
    this.container = this.section.querySelector(".container");
    this.textContainer = this.container.querySelector(
      ".section6-text-container"
    );
    this.roomsGrid = this.container.querySelector(".rooms-grid");
    this.sheetId = config[config.status].section6SheetId;
    this.isMobile = window.innerWidth < 944;

    this.init();
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener("resize", this.handleResize);
  }

  handleResize() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < 944;

    if (wasMobile !== this.isMobile) {
      this.updateContent();
    }
  }

  async init() {
    try {
      const data = await DataService.fetchRoomsData(this.sheetId);
      if (data) {
        this.render(data);
        this.updateContent();
      } else {
        console.warn("Section6 data is not available");
      }
    } catch (error) {
      console.error("Error initializing Section6:", error);
    }
  }

  updateContent() {
    const title = this.textContainer.querySelector(".title");
    const description = this.textContainer.querySelector(".description");

    if (title && this.data) {
      title.innerHTML = this.isMobile
        ? this.data.section.title
          .replace(/\\n/g, "<br>")
          .replace("Social Rooms!", "Social<br>Rooms!")
        : this.data.section.title.replace(/\\n/g, "<br>");
    }

    if (description && this.data) {
      description.innerHTML = this.isMobile
        ? this.data.section.description.replace(/\\n/g, " ")
        : this.data.section.description.replace(/\\n/g, "<br>");
    }
  }

  render(data) {
    this.data = data; // Store data for responsive updates

    // Update section title and description
    this.textContainer.innerHTML = `
      <p class="title">${data.section.title.replace(/\\n/g, "<br>")}</p>
      <p class="description">${data.section.description.replace(
      /\\n/g,
      "<br>"
    )}</p>
    `;

    // Clear and update rooms grid
    this.roomsGrid.innerHTML = data.rooms
      .map(
        (room) => `
        <div class="room">
          <p class="value-deal">
            <span>${room.label}</span>
          </p>
          <div class="room-content">
            <div class="room-text-container">
              <div class="room-name-container">
                <img src="${room.avatar}" alt="${room.userName}" />
                <p class="room-name">${room.userName}</p>
              </div>
            </div>
            <a class='card-cta-2' href='${room.url}'>
              Join
            </a>
          </div>
        </div>
      `
      )
      .join("");
  }

  destroy() {
    window.removeEventListener("resize", this.handleResize);
  }
}

class Section1Manager {
  constructor() {
    this.section = document.querySelector(".section1");
    this.textContainer = this.section.querySelector(".text-container");
    this.headerContainer = this.textContainer.querySelector(".header-container");
    this.cta = this.textContainer.querySelector('.card-cta-2');
    this.videoContainer = this.section.querySelector(".video-container");
    this.stickyFooterContent = document.querySelector('.mobile-sticky-footer .footer-text p');
    this.stickyFooterButton = document.querySelector('.mobile-sticky-footer .footer-cta');
    this.mobileScrollModalTitleContent = document.querySelector('.mobile-scroll-modal h1');
    this.mobileScrollModalSubTitleContent = document.querySelector('.mobile-scroll-modal p');
    this.mobileScrollModalButtons = document.querySelector('.mobile-scroll-modal .modal-buttons');
    this.sheetId = config[config.status].section1SheetId;
    this.videoLoaded = false;
    this.isMobile = window.innerWidth < 944;
    this.resizeTimeout = null;

    // Initialize intersection observer
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.videoLoaded) {
            this.loadVideo();
          }
        });
      },
      {
        threshold: 0,
        rootMargin: "100px 0px",
      }
    );

    this.init();
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener("resize", this.handleResize);
  }

  handleResize() {
    // Clear the timeout if it exists
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    // Set a new timeout
    this.resizeTimeout = setTimeout(() => {
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth < 944;

      // Only reload video if the mode has changed
      if (wasMobile !== this.isMobile && this.videoLoaded) {
        this.loadVideo();
      }
    }, 150); // Debounce time
  }

  async init() {
    try {
      const data = await DataService.fetchVideoData(this.sheetId);
      if (data) {
        this.render(data);
      } else {
        // console.warn("Section1 data is not available");
      }
    } catch (error) {
      console.log('error', error);
      // console.error("Error initializing Section1:", error);
    }
  }

  render(data) {
    // Text container update
    this.headerContainer.innerHTML = `
      <h1 class='gc-text'>${data.claimTitle}</h1>
      <h1 class='gc-prize'>${data.gcPrize?.replace('.', ',')}</h1>
      <h1 class='sc-prize'>${data.scPrize}</h1>
      <h1 class='sc-text'>${data.scText}</h1>
    `;
      
    this.stickyFooterContent.innerHTML = `${data.mobileConsentBannerTitle}`;
    this.mobileScrollModalTitleContent.innerHTML = `${data.mobilePopUpTitle}`;
    this.mobileScrollModalSubTitleContent.innerHTML = "";
    
    // Start observing for video loading
    this.observer.observe(this.videoContainer);
    // Store data for later use in loadVideo
    this.videoData = data;
    const style = document.createElement('style');
    style.innerHTML = data.style;
    document.head.appendChild(style);
  }

  getOs() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/iPad|iPhone|iPod|Macintosh|Mac OS/.test(userAgent) && !window.MSStream) {
      return "iOS";
    }
    if (/SamsungBrowser/i.test(userAgent) || /SM-|SAMSUNG|Galaxy/i.test(userAgent)) {
      return "Samsung";
    }
    if (/android/i.test(userAgent)) {
      return "Android";
    }
    return "other";
  }

  loadVideo() {
    if (!this.videoData) return;
    const data = this.videoData;
    const isMobile = window.innerWidth < 944;
    this.videoContainer.innerHTML = `
      <video
        autoplay
        muted
        playsinline 
        loop
        loading="lazy"
        preload="metadata"
        poster="${isMobile ? data.mobilePoster : data.desktopPoster}"
        class="video ${isMobile ? "video-mobile" : "video-desktop"}"
      >
        <source 
          type="video/mp4"
          src="${isMobile ? data.mobileMP4 : data.desktopMP4}"
        />
        ${isMobile && data.mobileWebM
        ? `
          <source 
            type="video/webm"
             src="${data.mobileWebM}"
          />
        `
        : ""
      }
      </video>
    `;

    this.videoLoaded = true;
  }

  destroy() {
    // Remove resize event listener
    window.removeEventListener("resize", this.handleResize);

    // Disconnect observer
    this.observer.disconnect();

    // Clear timeout
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
  }
}



class Section7Manager {
  constructor() {
    this.section = document.querySelector(".section7");
    this.textContainer = this.section.querySelector(".text-container7");
    this.videoContainer = this.section.querySelector(".video-container7");
    this.animContainer = this.section.querySelector('.anim-container7');
    this.sheetId = config[config.status].section7SheetId;
    this.videoLoaded = false;
    this.isMobile = window.innerWidth < 944;
    this.resizeTimeout = null;

    this.init();
  }

  handleResize() {
    // Clear the timeout if it exists
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    // Set a new timeout
    this.resizeTimeout = setTimeout(() => {
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth < 944;

      // Only reload video if the mode has changed
      if (wasMobile !== this.isMobile && this.videoLoaded) {
        this.loadVideo();
      }
    }, 150); // Debounce time
  }

  async init() {
    try {
      const data = await DataService.fetchVideo7Data(this.sheetId);
      if (data) {
        this.render(data);
      } else {
        console.warn("Section7 data is not available");
      }
    } catch (error) {
      console.error("Error initializing Section7:", error);
    }
  }

  render(data) {
    // Text container update
    this.textContainer.innerHTML = `
      <h1>${data.title.replace(/\\n/g, "<br>")}</h1>
      <a class='card-cta-2' href='${data.ctaLink}'>
              ${data.ctaText}
      </a>
      `;
    data.chars.forEach((char, idx) => {
      const img = document.createElement('img');
      img.src = char;
      img.alt = `MyPrize Character ${idx + 1}`;
      img.draggable = false;
      img.className = `char${idx + 1}`;
      this.animContainer.append(img);
    });
    data.items.forEach((item, idx) => {
      const img = document.createElement('img');
      img.src = item;
      img.alt = `MyPrize Item ${idx + 1}`;
      img.draggable = false;
      img.className = `item${idx + 1} section7-item`;
      this.animContainer.append(img);
    });
    this.cursorAnim();
    const style = document.createElement('style');
    style.innerHTML = data.style;
    document.head.appendChild(style);
  }

  cursorAnim() {
    this.cursorElements = Array.from(this.animContainer.querySelectorAll('.section7-item'));
    var cursor = document.querySelector("body");
    document.addEventListener("mousemove", (e) => {
      var x = e.clientX * 0.02;
      var y = e.clientY * 0.02;

      this.cursorElements.forEach(element => {
        element.style.transform = `translate(calc(var(--translateX) - ${x}px), calc(var(--translateY) - ${y}px))`;
      });
    });
  }

  destroy() {
    // Remove resize event listener
    window.removeEventListener("resize", this.handleResize);

    // Disconnect observer
    this.observer.disconnect();

    // Clear timeout
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
  }
}

class Section8Manager {
  constructor() {
    this.section = document.querySelector(".section8");
    this.textContainer = this.section.querySelector(".text-container8");
    this.videoContainer = this.section.querySelector(".video-container8");
    this.sheetId = config[config.status].section8SheetId;
    this.videoLoaded = false;
    this.isMobile = window.innerWidth < 944;
    this.resizeTimeout = null;

    // Initialize intersection observer
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.videoLoaded) {
            this.loadVideo();
          }
        });
      },
      {
        threshold: 0,
        rootMargin: "100px 0px",
      }
    );

    this.init();
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener("resize", this.handleResize);
  }

  handleResize() {
    // Clear the timeout if it exists
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    // Set a new timeout
    this.resizeTimeout = setTimeout(() => {
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth < 944;

      // Only reload video if the mode has changed
      if (wasMobile !== this.isMobile && this.videoLoaded) {
        this.loadVideo();
      }
    }, 150); // Debounce time
  }

  async init() {
    try {
      const data = await DataService.fetchVideo8Data(this.sheetId);
      if (data) {
        this.render(data);
      } else {
        // console.warn("Section8 data is not available");
      }
    } catch (error) {
      // console.error("Error initializing Section8:", error);
    }
  }

  render(data) {
    // Text container update
    this.textContainer.innerHTML = `
      <h1>${data.title.replace(/\\n/g, "<br>")}</h1>
    `;

    // Start observing for video loading
    this.observer.observe(this.videoContainer);

    // Store data for later use in loadVideo
    this.videoData = data;
  }

  loadVideo() {
    if (!this.videoData) return;

    const data = this.videoData;
    const isMobile = window.innerWidth < 944;

    this.videoContainer.innerHTML = `
      <video
        autoplay
        muted
        playsinline 
        loop
        loading="lazy"
        preload="metadata"
        poster="${isMobile ? data.mobilePoster : data.desktopPoster}"
        class="video ${isMobile ? "video-mobile" : "video-desktop"}"
      >
        <source 
          src="${isMobile ? data.mobileMP4 : data.desktopMP4}" 
          type="video/mp4"
        />
        ${isMobile && data.mobileWebM
        ? `
          <source 
            src="${data.mobileWebM}" 
            type="video/webm"
          />
        `
        : ""
      }
      </video>
    `;

    this.videoLoaded = true;
  }

  destroy() {
    // Remove resize event listener
    window.removeEventListener("resize", this.handleResize);

    // Disconnect observer
    this.observer.disconnect();

    // Clear timeout
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
  }
}

class Section3Manager {
  constructor() {
    this.section = document.querySelector("#section3");
    this.sections = document.querySelector('section');
    this.container = this.section.querySelector(".rewards-container");
    this.textContainer = this.section.querySelector(".text-container");
    this.rankNovice = this.section.querySelector('.rank.novice');
    this.rankRookie = this.section.querySelector('.rank.rookie');
    this.rankAmateur = this.section.querySelector('.rank.amateur');
    this.rankIntiate = this.section.querySelector('.rank.intiate');
    this.rankApprentice = this.section.querySelector('.rank.apprentice');
    this.rankEnthusiast = this.section.querySelector('.rank.enthusiast');
    this.rankExpert = this.section.querySelector('.rank.expert');
    this.rankHighroller = this.section.querySelector('.rank.highroller');
    this.rankPro = this.section.querySelector('.rank.pro');
    this.rankAce = this.section.querySelector('.rank.ace');
    this.sheetId = config[config.status].section3SheetId;
    this.observer = new IntersectionObserver(this.trackOnViewport.bind(this), {
      root: null,
      threshold: Array.from({ length: 100 }, (_, i) => i / 100)
    });


    this.init();
    this.observer.observe(this.section);
  }

  async init() {
    try {
      const data = await DataService.fetchRanksData(this.sheetId);
      if (data) {
        this.render(data);
      } else {
        console.warn("Section3 data is not available");
      }
    } catch (error) {
      console.error("Error initializing Section3:", error);
    }
  }

  handleRank(baseEl, percentage, min, max) {
    if (!baseEl.classList.contains('show')) baseEl.classList.add('show');

    let linePercentage = 0;

    if (percentage <= min) {
      linePercentage = 0;
    } else if (percentage >= max) {
      linePercentage = 100;
    } else {
      linePercentage = ((percentage - min) / (max - min)) * 100;
    }

    const lineEl = baseEl.querySelector('.rank-line');
    if (lineEl) {
      lineEl.style.width = `${linePercentage}%`;
    }
  }

  trackOnViewport(entries) {
    entries.forEach(entry => {
      requestAnimationFrame(() => {
        const sectionRect = entry.target.getBoundingClientRect();
        const windowHeight = document.documentElement.clientHeight;
        let sectionHeight = sectionRect.height;
        const scrollY = window.scrollY || window.pageYOffset;
        const sectionTopToPageTop = sectionRect.top + scrollY;
        let distanceScrolledInSection = (scrollY + windowHeight - sectionTopToPageTop);
        let percentage = Math.min(Math.max(distanceScrolledInSection / sectionHeight, 0), 1) * 100;
        percentage = Math.round(percentage);
        // Use the percentage value here
        if (percentage >= 55) {
          // novice
          this.handleRank(this.rankNovice, percentage, 55, 60);
          this.rankAmateur.classList.remove('show');
          this.rankRookie.classList.remove('show');
          this.rankIntiate.classList.remove('show');
          this.rankApprentice.classList.remove('show');
          this.rankEnthusiast.classList.remove('show');
          this.rankExpert.classList.remove('show');
          this.rankHighroller.classList.remove('show');
          this.rankPro.classList.remove('show');
          this.rankAce.classList.remove('show');
        }
        if (percentage >= 60) {
          // rookie
          this.handleRank(this.rankRookie, percentage, 60, 65);
          this.rankAmateur.classList.remove('show');
          this.rankIntiate.classList.remove('show');
          this.rankApprentice.classList.remove('show');
          this.rankEnthusiast.classList.remove('show');
          this.rankExpert.classList.remove('show');
          this.rankHighroller.classList.remove('show');
          this.rankPro.classList.remove('show');
          this.rankAce.classList.remove('show');
        }
        if (percentage >= 65) {
          // amateur
          this.handleRank(this.rankAmateur, percentage, 65, 70);
          this.rankIntiate.classList.remove('show');
          this.rankApprentice.classList.remove('show');
          this.rankEnthusiast.classList.remove('show');
          this.rankExpert.classList.remove('show');
          this.rankHighroller.classList.remove('show');
          this.rankPro.classList.remove('show');
          this.rankAce.classList.remove('show');
        }
        if (percentage >= 70) {
          // intiate
          this.handleRank(this.rankIntiate, percentage, 70, 75);
          this.rankApprentice.classList.remove('show');
          this.rankEnthusiast.classList.remove('show');
          this.rankExpert.classList.remove('show');
          this.rankHighroller.classList.remove('show');
          this.rankPro.classList.remove('show');
          this.rankAce.classList.remove('show');
        }
        if (percentage >= 75) {
          // apprentice
          this.handleRank(this.rankApprentice, percentage, 75, 80);
          this.rankEnthusiast.classList.remove('show');
          this.rankExpert.classList.remove('show');
          this.rankHighroller.classList.remove('show');
          this.rankPro.classList.remove('show');
          this.rankAce.classList.remove('show');
        }
        if (percentage >= 80) {
          // enthusiast
          this.handleRank(this.rankEnthusiast, percentage, 80, 85);
          this.rankExpert.classList.remove('show');
          this.rankHighroller.classList.remove('show');
          this.rankPro.classList.remove('show');
          this.rankAce.classList.remove('show');
        }
        if (percentage >= 85) {
          // expert
          this.handleRank(this.rankExpert, percentage, 85, 90);
          this.rankHighroller.classList.remove('show');
          this.rankPro.classList.remove('show');
          this.rankAce.classList.remove('show');
        }
        if (percentage >= 90) {
          // high roller
          this.handleRank(this.rankHighroller, percentage, 90, 95);
          this.rankPro.classList.remove('show');
          this.rankAce.classList.remove('show');
        }
        if (percentage >= 95) {
          // pro
          this.handleRank(this.rankPro, percentage, 95, 100);
          this.rankAce.classList.remove('show');
        }
        if (percentage === 100) {
          // ace
          this.handleRank(this.rankAce, percentage, 100, 100);
        }
      });
    });
  }
  render(data) {
    // Update text container
    this.textContainer.innerHTML = `
      <h3 >${data.section.title}</h3>
      <p class="rewards-description">${data.section.description}</p>
    `;

    // Update CTA button
    const ctaButton = this.container.querySelector(".card-cta-2");
    if (ctaButton) {
      ctaButton.href = data.section.ctaHref;
      ctaButton.innerHTML = `${data.section.ctaText}`;
    }
  }

}

class Section2Manager {
  constructor() {
    this.section = document.querySelector("#section2");
    this.container = this.section.querySelector(".container");
    this.textContainer = this.container.querySelector(".text-container");
    this.packagesWrapper = this.container.querySelector(".packages-wrapper");
    this.packagesWrapperMobile = this.container.querySelector(
      ".packages-wrapper-mobile"
    );
    this.swiperWrapper =
      this.packagesWrapperMobile.querySelector(".swiper-wrapper");
    this.sheetId = config[config.status].section2SheetId;
    this.swiper = null;

    this.init();
  }

  async init() {
    try {
      const data = await DataService.fetchSheetData(this.sheetId);
      if (data) {
        await this.render(data);
        this.initSwiper(); // Render işleminden sonra Swiper'ı başlat
        this.handleResponsive(); // Responsive davranışı yönet
      } else {
        console.warn("Section2 data is not available");
      }
    } catch (error) {
      console.error("Error initializing Section2:", error);
    }
  }

  initSwiper() {
    // Mobil görünümde değilse Swiper'ı başlatma
    if (window.innerWidth > 1024) {
      return;
    }

    // Eğer önceden bir Swiper instance'ı varsa destroy et
    if (this.swiper) {
      this.swiper.destroy(true, true);
    }

    // Yeni Swiper instance'ı oluştur
    this.swiper = new Swiper(".swiper", {
      slidesPerView: 1,
      spaceBetween: 30,
      centeredSlides: true,
      loop: false,
      speed: 500, // Transition speed
      effect: "slide",
      watchSlidesProgress: true, // Enable better slide tracking
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      breakpoints: {
        320: {
          slidesPerView: 1,
          spaceBetween: 20,
        },
        480: {
          slidesPerView: 1,
          spaceBetween: 30,
        },
      },
      on: {
        slideChange: function () {
          // Ensure smooth transition between slides
          const slides = this.slides;
          slides.forEach((slide) => {
            if (slide.classList.contains("swiper-slide-active")) {
              slide.style.transition = "transform 0.5s ease";
            }
          });
        },
      },
    });
  }

  handleResponsive() {
    // İlk yükleme için kontrol et
    this.updateLayout(window.innerWidth <= 1024);

    // Ekran boyutu değişikliklerini dinle
    window.addEventListener("resize", () => {
      this.updateLayout(window.innerWidth <= 1024);
    });
  }

  updateLayout(isMobile) {
    if (isMobile) {
      this.packagesWrapperMobile.style.display = "block";
      this.packagesWrapper.style.display = "none";
      this.initSwiper();
    } else {
      this.packagesWrapperMobile.style.display = "none";
      this.packagesWrapper.style.display = "flex";
      if (this.swiper) {
        this.swiper.destroy(true, true);
        this.swiper = null;
      }
    }
  }

  render(data) {
    const headers = data.values[0];
    const getColumnIndex = (columnName) => headers.indexOf(columnName);

    // Get column indices
    const titleIndex = getColumnIndex("Section Title");
    const ctaTextIndex = getColumnIndex("Section CTA Text");
    const ctaHrefIndex = getColumnIndex("Section CTA Href");
    const styleText = getColumnIndex("style");

    // Update section title
    this.textContainer.innerHTML = `
      <h2>${data.values[1][titleIndex]}</h2>
    `;

    // Clear existing packages
    this.packagesWrapper.innerHTML = `
      <div class="green-layer-blur"></div>
      <div class="green-layer-blur-2"></div>
    `;

    // Clear existing mobile packages
    this.swiperWrapper.innerHTML = "";

    // Add package cards for both desktop and mobile
    data.values.slice(1).forEach((row, idx) => {
      const isActive = row[getColumnIndex("isActive")];
      if (isActive === "TRUE") {
        const label = row[getColumnIndex("label")];
        const gcAmount = row[getColumnIndex("gcAmount")];
        const scAmount = row[getColumnIndex("scAmount")];
        const cardType = row[getColumnIndex("cardType")];
        const ctaText = row[getColumnIndex("ctaText")];
        const ctaDesc = row[getColumnIndex("ctaDesc")];
        const ctaPrize = row[getColumnIndex("ctaPrize")];
        const ctaLink = row[getColumnIndex("ctaLink")];
        const discount = row[getColumnIndex('discount')];
        const discountPrize = row[getColumnIndex('discountPrize')];

        // Create card content
        const cardContent = `
          <div class="package-card-content">
            <p class="${cardType === "standart"
            ? "package-card-standart-label"
            : "package-card-popular-label"
          }">
              <span>${label}</span>
            </p>
            <div class="package-card-content-container">
              <div class="card-icon-container">
                <p id="gc-icon"></p>
                <p id="sc-icon" class="sc-amount">
                  <span>${scAmount}</span>
                </p>
              </div>
              <p class="card-value">${gcAmount.replace('.', ',')} GC</p>
               <a href="${ctaLink}" class="card-cta">
                <span class="card-cta-prize">${ctaPrize}</span>
                <span class="card-cta-text">${ctaText}</span>
              </a>
              <a class='card-cta-2' href='${ctaLink}'>
                <span>${discount}</span>
                ${discountPrize}
              </a>
            </div>
          </div>
        `;

        // Desktop card
        const card = document.createElement("div");
        card.id = cardType === "standart" ? "package-card-standart" : "";
        card.className = "package-card";
        card.innerHTML = cardContent;
        this.packagesWrapper.appendChild(card);

        // Mobile card
        const mobileSlide = document.createElement("div");
        mobileSlide.className = "swiper-slide";
        const mobileCard = document.createElement("div");
        mobileCard.id = cardType === "standart" ? "package-card-standart" : "";
        mobileCard.className = "package-card";
        mobileCard.innerHTML = cardContent;
        mobileSlide.appendChild(mobileCard);
        this.swiperWrapper.appendChild(mobileSlide);
      }
    });

    // Update CTA button
    const ctaButton = this.container.querySelector("#section2Cta");
    if (ctaButton) {
      ctaButton.href = data.values[1][ctaHrefIndex];
      ctaButton.innerHTML = `${data.values[1][ctaTextIndex].replace("\\n", "")}<div class='background'><div class='particles'></div></div>`;
    }
  }
}

class Section5Manager {
  constructor() {
    this.section = document.querySelector("#section5");
    this.container = this.section.querySelector(".games-container");
    this.textContainer = this.container.querySelector(".text-container");
    this.gamesGrid = this.container.querySelector(".games-grid");
    this.sheetId = config[config.status].section5SheetId;

    this.init();
  }

  async init() {
    try {
      const data = await DataService.fetchGamesData(this.sheetId);
      if (data) {
        this.render(data);
      } else {
        console.warn("Section5 data is not available");
      }
    } catch (error) {
      console.error("Error initializing Section5:", error);
    }
  }

  render(data) {
    // Update section title if exists
    if (data.section.title) {
      this.textContainer.innerHTML = `
        <h3 class="">${data.section.title}</h3>
      `;
    }

    // Clear and update games grid
    this.gamesGrid.innerHTML = data.games
      .map(
        (game) => `
        <a href="${game.href}" class="game-card">
          <picture>
            <source type="image/webp" srcset="${game.imgSrc.replace('.png', '.webp')}">
            <source type="image/png" srcset="${game.imgSrc}">
            <img src="${game.imgSrc}" alt="${game.name}" />
          </picture>
        </a>
      `
      )
      .join("");

    // Update CTA button if exists
    const ctaContainer = this.container.querySelector(
      "div[style='display: flex; justify-content: center']"
    );
    if (ctaContainer && data.section.ctaText) {
      ctaContainer.innerHTML = `
      <a class='card-cta-2' href='${data.section.ctaHref}'>
              ${data.section.ctaText}
      </a>
        `;
    }
  }
}
class Section9Manager {
  constructor() {
    this.section = document.querySelector("#section9");
    this.reviewTrack = this.section.querySelector(".review-track");
    this.header = this.section.querySelector('h1');
    this.sheetId = config[config.status].section9SheetId;

    this.init();
  }

  async init() {
    try {
      const data = await DataService.fetchSheetData(this.sheetId);
      if (data) {
        this.render(data);
      } else {
        console.warn("Section9 data is not available");
      }
    } catch (error) {
      console.error("Error initializing Section9:", error);
    }
  }

  render(data) {
    try {
      this.header.innerHTML = data.sectionHeader;
      this.reviewTrack.innerHTML = '';
      data.activeItems.forEach((item) => {
        const card =
          item.type === "Review"
            ? this.createReviewCard(item)
            : this.createWinnerCard(item);
        this.reviewTrack.appendChild(card);
      });
      const cards = this.reviewTrack.querySelectorAll(
        ".review-card, .winner-card"
      );
      cards.forEach((card) => {
        const clone = card.cloneNode(true);
        this.reviewTrack.appendChild(clone);
      });
      this.updateScrollAnimation();
      this.section.style.display = "block";
    } catch (error) {
      console.error("Error rendering cards:", error);
    }
  }

  updateScrollAnimation() {
    const track = this.reviewTrack;
    const cards = track.querySelectorAll(".review-card, .winner-card");
    const cardCount = cards.length;

    if (cardCount === 0) return;

    // Get the width and margin value of the first card
    const cardWidth = cards[0].offsetWidth;
    const cardMargin = parseInt(window.getComputedStyle(cards[0]).marginRight);

    // Calculate total scroll distance
    const totalWidth = cardCount * (cardWidth + cardMargin);

    // Set animation duration according to number of cards (3 seconds for each card)
    const animationDuration = cardCount * 3;

    // Update CSS animation
    const style = document.createElement("style");
    style.textContent = `
      @keyframes scroll {
        0% {
          transform: translateX(0);
        }
        100% {
          transform: translateX(-${totalWidth / 2}px);
        }
      }
      
      .review-track {
        animation: scroll ${animationDuration}s linear infinite;
      }
    `;

    // Remove old style element if present
    const oldStyle = document.getElementById("review-animation-style");
    if (oldStyle) {
      oldStyle.remove();
    }

    // Add new style element
    style.id = "review-animation-style";
    document.head.appendChild(style);
  }

  createReviewCard(review) {
    const card = document.createElement("div");
    card.className = "review-card";

    // Create star rating
    const stars = parseInt(review.rating);

    card.innerHTML = `
      <div class="card-inner-container">
        <div class="star-rating">
          ${Array(stars).fill('<div class="star">★</div>').join("")}
        </div>
        <span class="review-date">${review.date}</span>
        <p class="review-title">${review.title}</p>
        <p class="review-content">${review.content}</p>
        <div class="reviewer-name">${review.name}</div>
      </div>
    `;
    return card;
  }

  createWinnerCard(winner) {
    const card = document.createElement("div");
    card.className = "winner-card";
    card.innerHTML = `
      <div class="card-inner-container">
        <p>${winner.content.replaceAll('{PRIZE_AMOUNT}', `<span class="winner-card-amount">${Number(winner.prizeAmount).toLocaleString('en-US')}</span>`)
        .replaceAll('{GAME_TYPE}', `<spin class="winner-card-amount">${winner.gameType}</spin>`)
        .replaceAll('{SPIN_AMOUNT}', `<span class="winner-card-amount">${winner.spinAmount}</span>`)
        .replaceAll('{NAME}', winner.name)
      }</p>
      </div>
    `
    return card;
  }

  addResizeListener() {
    window.addEventListener("resize", () => {
      this.updateScrollAnimation();
    });
  }
}

class NavbarManager {
  constructor() {
    this.navLinks = document.querySelector("#nav-links");
    this.sheetId = config[config.status].navbarSheetId;
    this.init();
  }

  async init() {
    try {
      const data = await DataService.fetchNavbarData(this.sheetId);
      if (data) {
        this.render(data);
      } else {
        console.warn("Navbar data is not available");
      }
    } catch (error) {
      console.error("Error initializing Navbar:", error);
    }
  }

  render(data) {
    // Clear existing links
    this.navLinks.innerHTML = "";

    // Add new links
    data.navItems.forEach((item, index) => {
      const link = document.createElement("a");
      link.href = item.href;
      link.textContent = item.text;

      // Add appropriate classes
      if (index === 0) {
        link.id = "login";
      } else if (index === 1) {
        link.id = "sign-up";
        link.className = "navbar-cta card-cta-2";
        link.innerHTML = `
        ${item.text}
        `
      }

      this.navLinks.appendChild(link);
    });

    if (!data.hideLoader) {
      const loaderCont = document.querySelector('#loader-container');
      loaderCont.classList.add('show-always');
    }
  }
}

class Section4Manager {
  constructor() {
    this.section = document.querySelector(".section4");
    this.carousel = this.section.querySelector(".carousel");
    this.carouselMobile = this.section.querySelector(".carousel-mobile");
    this.sheetId = config[config.status].section4SheetId;
    this.mobileSheetId = config[config.status].section4MobileSheetId;
    this.carouselInterval = null;
    this.mobileCarouselInterval = null;
    this.isMobile = window.innerWidth < 1025;
    this.resizeTimeout = null;

    this.init();
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener("resize", this.handleResize);
  }

  handleResize() {
    // Clear the timeout if it exists
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    // Set a new timeout
    this.resizeTimeout = setTimeout(() => {
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth < 1025;

      // Only reinitialize if the mode has changed
      if (wasMobile !== this.isMobile) {
        this.reinitializeCarousels();
      }
    }, 150); // Debounce time
  }

  async reinitializeCarousels() {
    // Clear existing intervals
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
      this.carouselInterval = null;
    }
    if (this.mobileCarouselInterval) {
      clearInterval(this.mobileCarouselInterval);
      this.mobileCarouselInterval = null;
    }

    // Remove existing event listeners
    if (this.carousel) {
      this.carousel.removeEventListener(
        "transitionend",
        this.handleTransitionEnd
      );
    }
    if (this.carouselMobile) {
      this.carouselMobile.removeEventListener(
        "transitionend",
        this.handleTransitionEnd
      );
    }

    // Reinitialize based on current mode
    if (this.isMobile) {
      // Reset desktop carousel
      if (this.carousel) {
        this.carousel.style.transform = "";
        this.carousel.style.transition = "";
      }

      // Initialize mobile carousel
      if (this.carouselMobile) {
        await this.renderMobile(
          await DataService.fetchMobileCarouselData(this.mobileSheetId)
        );
        this.initializeMobileCarousel();
      }
    } else {
      // Reset mobile carousel
      if (this.carouselMobile) {
        this.carouselMobile.style.transform = "";
        this.carouselMobile.style.transition = "";
      }

      // Initialize desktop carousel
      if (this.carousel) {
        await this.render(await DataService.fetchCarouselData(this.sheetId));
        this.initializeCarousel();
      }
    }
  }

  async init() {
    try {
      this.isMobile = window.innerWidth < 1025;

      if (this.isMobile) {
        const mobileData = await DataService.fetchMobileCarouselData(
          this.mobileSheetId
        );
        if (mobileData) {
          await this.renderMobile(mobileData);
          this.initializeMobileCarousel();
        } else {
          console.warn("Mobile carousel data is not available");
        }
      } else {
        const desktopData = await DataService.fetchCarouselData(this.sheetId);
        if (desktopData) {
          await this.render(desktopData);
          this.initializeCarousel();
        } else {
          console.warn("Desktop carousel data is not available");
        }
      }
    } catch (error) {
      console.error("Error initializing Section4:", error);
    }
  }

  destroy() {
    // Remove resize event listener
    window.removeEventListener("resize", this.handleResize);

    // Clear intervals
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
    if (this.mobileCarouselInterval) {
      clearInterval(this.mobileCarouselInterval);
    }

    // Clear timeout
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
  }

  async renderMobile(slides) {
    // Clear existing carousel content
    this.carousel.innerHTML = "";
    this.carouselMobile.innerHTML = "";

    // Add wrapper for proper sliding
    this.carouselMobile.style.display = "flex";
    this.carouselMobile.style.transition = "transform 0.5s ease-in-out";
    this.carouselMobile.style.width = "100%";
    this.carouselMobile.style.position = "relative";

    // Create slides
    slides.forEach((slide) => {
      const slideElement = document.createElement("div");
      slideElement.id = slide.slideId + "-mobile";
      slideElement.className = "carousel-item-mobile";
      slideElement.style.minWidth = "100%";
      slideElement.style.position = "relative";
      slideElement.style.transition = "all 0.5s ease-in-out";
      slideElement.style.opacity = "0";
      slideElement.style.visibility = "hidden";

      slideElement.style.backgroundImage = `url('${slide.background}')`;
      slideElement.style.backgroundSize = "150%";
      slideElement.style.backgroundPosition = "75% center";
      slideElement.style.backgroundRepeat = "no-repeat";


      slideElement.innerHTML = `
        <div class="slide-text-container-mobile">
          <div>
            <p class="title">${slide.title.replace(/\\n/g, "<br>")}</p>
            <p class="description">${slide.description.replace(
        /\\n/g,
        "<br>"
      )}</p>
          </div>
          ${slide.ctaText
          ? `
          <a class='card-cta-2' href='${slide.ctaLink}'>
              ${slide.ctaText}
            </a>`
          : ""
        }
        </div>
      `;

      this.carouselMobile.appendChild(slideElement);
    });

    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  }

  async render(slides) {
    // Clear existing carousel content
    this.carousel.innerHTML = "";
    this.carouselMobile.innerHTML = '';

    // Create slides
    slides.forEach((slide) => {
      const slideElement = document.createElement("div");
      slideElement.id = slide.slideId;
      slideElement.className = "carousel-item";

      // Add background image as style
      slideElement.style.backgroundImage = `url('${slide.background}')`;
      slideElement.style.backgroundSize = "contain";
      slideElement.style.backgroundRepeat = "no-repeat";

      const slideContent = `
        <div class="slide-text-container">
          <p class="title">${slide.title.replace(/\\n/g, "<br>")}</p>
          <p class="description">${slide.description.replace(
        /\\n/g,
        "<br>"
      )}</p>
          ${slide.ctaText
          ? `
          <a class='card-cta-2' href='${slide.ctaLink}'>
            ${slide.ctaText}
          </a>`
          : ""
        }
        </div>
      `;

      slideElement.innerHTML = slideContent;
      this.carousel.appendChild(slideElement);
    });

    // Wait for all slides to load
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  }

  initializeCarousel() {
    const items = this.carousel.querySelectorAll(".carousel-item");
    if (!items.length) return;

    const totalItems = items.length;
    let currentIndex = 0;
    let isTransitioning = false;
    let isDragging = false;
    let startX = 0;

    const updateCarousel = (animate = true) => {
      const slideWidth = 92;
      const maxClones = 4;
      const allItems = this.carousel.querySelectorAll(".carousel-item");

      // Clean up excess clones
      if (allItems.length > totalItems + maxClones) {
        const excessClones = allItems.length - (totalItems + maxClones);
        for (let i = 0; i < excessClones; i++) {
          this.carousel.removeChild(allItems[i]);
        }
      }

      // When we come to the last slide, go back to the beginning
      if (currentIndex >= allItems.length) {
        currentIndex = 0;
        this.carousel.style.transition = "none";
        this.carousel.style.transform = `translateX(0)`;
        // Force reflow
        this.carousel.offsetHeight;
      }

      const offset = -currentIndex * slideWidth;
      this.carousel.style.transition = animate
        ? "transform 0.5s ease-in-out"
        : "none";
      this.carousel.style.transform = `translateX(${offset}%)`;

      allItems.forEach((item, index) => {
        item.classList.remove("active");
        if (index === currentIndex) {
          item.classList.add("active");
          item.style.transform = "scale(1.05)";
          item.style.opacity = "1";
          item.style.zIndex = "2";
        } else if (index === currentIndex - 1 || index === currentIndex + 1) {
          item.style.transform = "scale(0.95)";
          item.style.opacity = "0.7";
          item.style.zIndex = "1";
        } else {
          item.style.transform = "scale(0.9)";
          item.style.opacity = "0.5";
          item.style.zIndex = "0";
        }
      });

      // Add a new slide when you are close to the last 2 slides
      if (
        currentIndex >= allItems.length - 2 &&
        allItems.length < totalItems + maxClones
      ) {
        const nextSlideIndex = (currentIndex + 2) % totalItems;
        const nextSlide = items[nextSlideIndex].cloneNode(true);
        this.carousel.appendChild(nextSlide);
      }
    };

    const nextSlide = () => {
      if (isTransitioning || isDragging) return;
      isTransitioning = true;
      currentIndex++;
      updateCarousel(true);
    };

    const prevSlide = () => {
      if (isTransitioning || isDragging || currentIndex <= 0) return;
      isTransitioning = true;
      currentIndex--;
      updateCarousel(true);
    };

    // Handle transition end
    this.carousel.addEventListener("transitionend", () => {
      isTransitioning = false;
    });

    // Mouse events
    this.carousel.addEventListener("mousedown", (e) => {
      if (isTransitioning) return;
      isDragging = true;
      startX = e.pageX;
      this.carousel.style.transition = "none";
    });

    this.carousel.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX;
      const walk = (x - startX) * 2;
      const slideWidth = this.carousel.offsetWidth * 0.92;
      const currentOffset = -currentIndex * slideWidth;

      requestAnimationFrame(() => {
        this.carousel.style.transform = `translateX(calc(${currentOffset}px + ${walk}px))`;
      });
    });

    const handleMouseUp = (e) => {
      if (!isDragging) return;
      isDragging = false;
      this.carousel.style.transition = "transform 0.5s ease-in-out";

      const x = e.pageX;
      const walk = x - startX;

      if (Math.abs(walk) > 50) {
        if (walk > 0 && currentIndex > 0) {
          prevSlide();
        } else if (walk < 0) {
          nextSlide();
        } else {
          updateCarousel(true);
        }
      } else {
        updateCarousel(true);
      }
    };

    this.carousel.addEventListener("mouseup", handleMouseUp);
    this.carousel.addEventListener("mouseleave", handleMouseUp);

    // Add navigation button event listeners
    const prevButton = this.carousel.parentElement.querySelector(
      ".swiper-button-prev"
    );
    const nextButton = this.carousel.parentElement.querySelector(
      ".swiper-button-next"
    );

    if (prevButton) {
      prevButton.addEventListener("click", prevSlide);
    }
    if (nextButton) {
      nextButton.addEventListener("click", nextSlide);
    }

    // Initial setup
    updateCarousel(false);

    // Auto-play for desktop carousel
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }

    this.carouselInterval = setInterval(() => {
      if (!isTransitioning && !isDragging) {
        nextSlide();
      }
    }, 3000);
  }

  initializeMobileCarousel() {
    const items = this.carouselMobile.querySelectorAll(".carousel-item-mobile");
    if (!items.length) return;

    const totalItems = items.length;
    let currentIndex = 0;
    let isTransitioning = false;

    const updateMobileCarousel = (animate = true) => {
      const slideWidth = 100;
      const allItems = this.carouselMobile.querySelectorAll(
        ".carousel-item-mobile"
      );

      // When we come to the last slide, go back to the beginning
      if (currentIndex >= allItems.length) {
        currentIndex = 0;
        this.carouselMobile.style.transition = "none";
        this.carouselMobile.style.transform = `translateX(0)`;
        this.carouselMobile.offsetHeight; // Force reflow
      }

      const offset = -currentIndex * slideWidth;
      this.carouselMobile.style.transition = animate
        ? "transform 0.5s ease-in-out"
        : "none";
      this.carouselMobile.style.transform = `translateX(${offset}%)`;

      // Update active slide
      allItems.forEach((item, index) => {
        item.classList.remove("active");
        if (index === currentIndex) {
          item.classList.add("active");
          item.style.opacity = "1";
          item.style.visibility = "visible";
        } else {
          item.style.opacity = "0";
          item.style.visibility = "hidden";
        }
      });
    };

    const nextSlide = () => {
      if (isTransitioning) return;
      isTransitioning = true;
      currentIndex++;
      updateMobileCarousel(true);
    };

    const prevSlide = () => {
      if (isTransitioning || currentIndex <= 0) return;
      isTransitioning = true;
      currentIndex--;
      updateMobileCarousel(true);
    };

    // Handle transition end
    this.carouselMobile.addEventListener("transitionend", () => {
      isTransitioning = false;
    });

    // Add navigation button event listeners
    const prevButton = this.carouselMobile.parentElement.querySelector(
      ".swiper-button-prev"
    );
    const nextButton = this.carouselMobile.parentElement.querySelector(
      ".swiper-button-next"
    );

    if (prevButton) prevButton.addEventListener("click", prevSlide);
    if (nextButton) nextButton.addEventListener("click", nextSlide);

    // Touch events
    let touchStartX = 0;
    let touchEndX = 0;

    this.carouselMobile.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX;
    });

    this.carouselMobile.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].clientX;
      const swipeThreshold = 50;
      const swipeDistance = touchEndX - touchStartX;

      if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0 && currentIndex > 0) {
          prevSlide();
        } else if (swipeDistance < 0) {
          nextSlide();
        }
      }
    });

    // Initial setup
    updateMobileCarousel(false);

    // Auto-play
    if (this.mobileCarouselInterval) {
      clearInterval(this.mobileCarouselInterval);
    }

    this.mobileCarouselInterval = setInterval(() => {
      if (!isTransitioning) {
        nextSlide();
      }
    }, 3000);
  }
}

class FooterManager {
  constructor() {
    this.footer = document.querySelector("footer");
    this.rightSide = this.footer.querySelector(".right-side");
    this.sheetId = config[config.status].footerSheetId;

    this.init();
  }

  async init() {
    try {
      const data = await DataService.fetchFooterData(this.sheetId);
      if (data) {
        this.render(data);
      } else {
        console.warn("Footer data is not available");
      }
    } catch (error) {
      console.error("Error initializing Footer:", error);
    }
  }

  render(data) {
    // Policy links
    if (data.policy) {
      const policyContainer = this.rightSide.querySelector("div:first-child");
      if (policyContainer) {
        policyContainer.innerHTML = `
          <p><b>Policy</b></p>
          ${data.policy
            .map(
              (link) => `
            <a href="${link.href}">
              <p>${link.text}</p>
            </a>
          `
            )
            .join("")}
        `;
      } else {
        console.error("Policy container not found");
      }
    }

    // Resources links
    if (data.resources) {
      const resourcesContainer = this.rightSide.querySelector("div:last-child");
      if (resourcesContainer) {
        resourcesContainer.innerHTML = `          <p><b>Resources</b></p>
          ${data.resources
            .map(
              (link) => `
            <a href="${link.href}">
              <p>${link.text}</p>
            </a>
          `
            )
            .join("")}
        `;
      } else {
        console.error("Resources container not found");
      }
    }
  }
}

const loaderCont = document.querySelector('#loader-container');
const section1 = document.querySelector(".section1");

const section7 = document.querySelector(".section7");

const section8 = document.querySelector(".section8");

const section6 = document.querySelector("#section6");
const textContainer6 = section6.querySelector(".section6-text-container");
const title6 = textContainer6.querySelector(".title");

const description6 = textContainer6.querySelector(".description");
const rewardsTitles = document.querySelectorAll(".rewards-title");


// Initialize managers
const section1Manager = new Section1Manager();
const section7Manager = new Section7Manager();

const section8Manager = new Section8Manager();

const section3Manager = new Section3Manager();
const section2Manager = new Section2Manager();
const section4Manager = new Section4Manager();
const section5Manager = new Section5Manager();
const section6Manager = new Section6Manager();
const section9Manager = new Section9Manager();
const navbarManager = new NavbarManager();
const footerManager = new FooterManager();

// Update content function
function updateContent(isMobile) {
  rewardsTitles[0].innerHTML = isMobile
    ? `Get rewarded for every minute you play!`
    : `Get rewarded for every minute you play!`;
}

// dom loaded
document.addEventListener("DOMContentLoaded", () => {
  updateContent(windowSize.isMobile.value);
});

// Subscribe to changes
const cleanup = windowSize.isMobile.subscribe((isMobile) => {
  updateContent(isMobile);
});

window.addEventListener('load', () => {
  loaderCont.classList.add('hide');
})