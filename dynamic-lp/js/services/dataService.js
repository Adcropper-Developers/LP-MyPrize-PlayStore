export class DataService {
   static async fetchSheetData(sheetId) {
    try {
      const response = await fetch(
        `https://api.adcropper.com/getsheet/${sheetId}`
      );
      const data = await response.json();

      // Section9 için özel işleme
      if (sheetId === '68b96b788987130364e70e20' || sheetId === '67b5d0349c0ab4ad8f0c6673') {
        const parsedData = JSON.parse(data[0]);
        const reviews = parsedData.values;
        const headers = reviews[0];

        const sectionHeader = parsedData.values[1][11];
        
        // Header'ı atla ve sadece Status'ü TRUE olan kayıtları filtrele
        const activeItems = reviews
          .slice(1)
          .filter((item) => item[headers.indexOf("STATUS")] === "TRUE")
          .map((item) => {
            const type = item[headers.indexOf("TYPE")];

            if (type === "Review") {
              return {
                type: "Review",
                id: item[headers.indexOf("ID")],
                name: item[headers.indexOf("NAME")],
                rating: item[headers.indexOf("RATING")],
                title: item[headers.indexOf("TITLE")],
                content: item[headers.indexOf("CONTENT")],
                date: item[headers.indexOf("DATE")],
              };
            } else if (type === "Winner") {
              return {
                type: "Winner",
                id: item[headers.indexOf("ID")],
                name: item[headers.indexOf("NAME")],
                date: item[headers.indexOf("DATE")],
                prizeAmount: item[headers.indexOf("PRIZE_AMOUNT")],
                gameType: item[headers.indexOf("GAME_TYPE")],
                spinAmount: item[headers.indexOf("SPIN_AMOUNT")],
                content: item[headers.indexOf("CONTENT")]
              };
            }
            return null;
          })
          .filter(Boolean);

        return {activeItems: activeItems, sectionHeader: sectionHeader};
      }

      // Parse the string JSON inside the array
      const parsedData = JSON.parse(data[0]);

      // Check if this is Section2 data (has specific structure)
      if (parsedData.values && parsedData.values[0].includes("Section Title")) {
        return parsedData;
      }

      // For other sections, continue with existing logic
      const values = parsedData.values;
      const headers = values[0];

      // Find active content (skip header row)
      const activeContent = values
        .slice(1)
        .find((row) => row[headers.indexOf("isActive")] === "TRUE");
      
      if (!activeContent) {
        // console.warn("No active content found");
        return null;
      }

      // Convert array to object using headers
      const result = {};
      headers.forEach((header, index) => {
        result[header] = activeContent[index];
      });

      return result;
    } catch (error) {
      console.error("Error fetching sheet data:", error);
      return null;
    }
  }


  static async fetchRanksData(sheetId) {
    try {
      const response = await fetch(
        `https://api.adcropper.com/getsheet/${sheetId}`
      );
      const data = await response.json();

      // Parse the string JSON inside the array
      const parsedData = JSON.parse(data[0]);

      // Get the values array
      const values = parsedData.values;

      // Get headers
      const headers = values[0];

      // Get section info (first row after headers)
      const sectionInfo = values[1];

      // Create section data object
      const sectionData = {
        title: sectionInfo[headers.indexOf("Section Title")],
        description: values
          .slice(1, 4)
          .map((row) => row[headers.indexOf("Section_Description")])
          .filter(Boolean)
          .join("<br>"),
        ctaText: sectionInfo[headers.indexOf("CTA Text")],
        ctaHref: sectionInfo[headers.indexOf("CTA_HREF")],
      };

      // Create ranks array
      const ranks = values.slice(1).map((row) => ({
        id: row[headers.indexOf("ID")],
        rank: row[headers.indexOf("RANK")],
        imagePath: row[headers.indexOf("Image Path")],
      }));

      return {
        section: sectionData,
        ranks: ranks,
      };
    } catch (error) {
      console.error("Error fetching ranks data:", error);
      return null;
    }
  }

  static async fetchCarouselData(sheetId) {
    try {
      const response = await fetch(
        `https://api.adcropper.com/getsheet/${sheetId}`
      );
      const data = await response.json();

      // Parse the string JSON inside the array
      const parsedData = JSON.parse(data[0]);
      const values = parsedData.values;
      const headers = values[0];

      // Map the slides data to a more usable format and filter active slides
      const slides = values
        .slice(1)
        .filter((row) => row[headers.indexOf("isActive")] === "TRUE")
        .map((row) => ({
          isActive: row[headers.indexOf("isActive")],
          slideId: row[headers.indexOf("Slide Id")],
          title: row[headers.indexOf("Title")],
          description: row[headers.indexOf("Description")],
          ctaText: row[headers.indexOf("CTA Text")],
          ctaLink: row[headers.indexOf("CTA Link")],
          background: row[headers.indexOf("Carousel Background")],
        }));

      return slides;
    } catch (error) {
      console.error("Error fetching carousel data:", error);
      return null;
    }
  }

  static async fetchMobileCarouselData(sheetId) {
    try {
      const response = await fetch(
        `https://api.adcropper.com/getsheet/${sheetId}`
      );
      const data = await response.json();

      // Parse the string JSON inside the array
      const parsedData = JSON.parse(data[0]);
      const values = parsedData.values;
      const headers = values[0];

      // Map the slides data to a more usable format and filter active slides
      const slides = values
        .slice(1)
        .filter((row) => row[headers.indexOf("isActive")] === "TRUE")
        .map((row) => ({
          isActive: row[headers.indexOf("isActive")],
          slideId: row[headers.indexOf("Slide Id")],
          title: row[headers.indexOf("Title")],
          description: row[headers.indexOf("Description")],
          ctaText: row[headers.indexOf("CTA Text")],
          ctaLink: row[headers.indexOf("CTA Link")],
          background: row[headers.indexOf("Carousel Background")],
        }));

      return slides;
    } catch (error) {
      console.error("Error fetching mobile carousel data:", error);
      return null;
    }
  }

  static async fetchNavbarData(sheetId) {
    try {
      const response = await fetch(
        `https://api.adcropper.com/getsheet/${sheetId}`
      );
      const data = await response.json();

      // Parse the string JSON inside the array
      const parsedData = JSON.parse(data[0]);
      const values = parsedData.values;
      const headers = values[0];
      const hideLoader = Boolean(values[1][headers.indexOf('hideLoader')]);
      // const hideLoader = Boolean(undefined);

      // Get active navbar items
      const navItems = values
        .slice(1)
        .filter((row) => row[headers.indexOf("isActive")] === "TRUE")
        .map((row) => ({
          text: row[headers.indexOf("CTA TEXT")],
          href: row[headers.indexOf("CTA HREF")],
          class: row[headers.indexOf("CTA CLASS")]
        }));
      return {navItems, hideLoader: hideLoader};
    } catch (error) {
      console.error("Error fetching navbar data:", error);
      return null;
    }
  }

  static async fetchGamesData(sheetId) {
    try {
      const response = await fetch(
        `https://api.adcropper.com/getsheet/${sheetId}`
      );
      const data = await response.json();

      // Parse the string JSON inside the array
      const parsedData = JSON.parse(data[0]);
      const values = parsedData.values;
      const headers = values[0];

      // Get section info (first row)
      const sectionInfo = {
        title: values[1]?.[headers.indexOf("Section Title")] || "",
        ctaText: values[1]?.[headers.indexOf("Section CTA Text")] || "",
        ctaHref: values[1]?.[headers.indexOf("Section CTA Href")] || "#",
      };

      // Get games data
      const games = values.slice(1).map((row) => ({
        id: row[headers.indexOf("ID")],
        name: row[headers.indexOf("Games Name")],
        imgSrc: row[headers.indexOf("Img Src")],
        href: row[headers.indexOf("Href ")] || "#",
      }));

      return {
        section: sectionInfo,
        games: games,
      };
    } catch (error) {
      console.error("Error fetching games data:", error);
      return null;
    }
  }

  static async fetchVideoData(sheetId) {
     try {
      const response = await fetch(
        `https://api.adcropper.com/getsheet/${sheetId}`
      );
      const data = await response.json();

      // Parse the string JSON inside the array
      const parsedData = JSON.parse(data[0]);
      const values = parsedData.values;
      const headers = values[0];

      // Find active content
      const activeContent = values
        .slice(1)
        .find((row) => row[headers.indexOf("isActive")] === "TRUE");

      if (!activeContent) {
        console.warn("No active video content found");
        return null;
      }
      // Convert array to object using headers
      const result = {
        desktopMP4: activeContent[headers.indexOf("desktopMP4")],
        mobileMP4: activeContent[headers.indexOf("mobileMP4")],
        mobileWebM: activeContent[headers.indexOf("mobileWebM")],
        desktopPoster: activeContent[headers.indexOf("desktopPoster")],
        mobilePoster: activeContent[headers.indexOf("MobilePoster")],
        claimTitle: activeContent[headers.indexOf("claimTitle")],
        gcPrize: activeContent[headers.indexOf("gcPrize")],
        scPrize: activeContent[headers.indexOf("scPrize")],
        scText: activeContent[headers.indexOf("scText")],
        ctaText: activeContent[headers.indexOf("ctaText")],
        ctaLink: activeContent[headers.indexOf("ctaLink")],
        appStoreCtaLink: activeContent[headers.indexOf("appStoreCtaLink")],
        googlePlayStoreCtaLink: activeContent[headers.indexOf("googlePlayStoreCtaLink")],
        galaxyStoreCtaLink: activeContent[headers.indexOf("galaxyStoreCtaLink")],
        mobilePopUpTitle: activeContent[headers.indexOf('mobilePopUpTitle')],
        mobileConsentBannerTitle: activeContent[headers.indexOf('mobileConsentBannerTitle')],
        style: activeContent[headers.indexOf('style')],
      }; 
      return result;
    } catch (error) {
      console.error("Error fetching video data:", error);
      return null;
    }
  }

  static async fetchVideo7Data(sheetId) {
    try {
      const response = await fetch(
        `https://api.adcropper.com/getsheet/${sheetId}`
      );
      const data = await response.json();

      // Parse the string JSON inside the array
      const parsedData = JSON.parse(data[0]);
      const values = parsedData.values;
      const headers = values[0];

      // Find active content
      const activeContent = values
        .slice(1)
        .find((row) => row[headers.indexOf("isActive")] === "TRUE");

      if (!activeContent) {
        console.warn("No active video content found");
        return null;
      }

      // Convert array to object using headers
      const result = {
        desktopMP4: activeContent[headers.indexOf("desktopMP4")],
        mobileMP4: activeContent[headers.indexOf("mobileMP4")],
        mobileWebM: activeContent[headers.indexOf("mobileWebM")],
        desktopPoster: activeContent[headers.indexOf("desktopPoster")],
        mobilePoster: activeContent[headers.indexOf("MobilePoster")],
        title: activeContent[headers.indexOf("title")],
        ctaText: activeContent[headers.indexOf("ctaText")],
        ctaLink: activeContent[headers.indexOf("ctaLink")],
        // chars: activeContent[headers.indexOf('chars')],
        chars: values.map(row => row[headers.indexOf('chars')]).slice(1).filter(value => value.trim() !== ''),
        items: values.map(row => row[headers.indexOf('items')]).slice(1).filter(value => value.trim() !== ''),
        style: activeContent[headers.indexOf('style')],
      };  
      return result;
    } catch (error) {
      console.error("Error fetching video7 data:", error);
      return null;
    }
  }

  static async fetchVideo8Data(sheetId) {
    try {
      const response = await fetch(
        `https://api.adcropper.com/getsheet/${sheetId}`
      );
      const data = await response.json();

      // Parse the string JSON inside the array
      const parsedData = JSON.parse(data[0]);
      const values = parsedData.values;
      const headers = values[0];

      // Find active content
      const activeContent = values
        .slice(1)
        .find((row) => row[headers.indexOf("isActive")] === "TRUE");

      if (!activeContent) {
        // console.warn("No active video content found");
        return null;
      }

      // Convert array to object using headers
      const result = {
        desktopMP4: activeContent[headers.indexOf("desktopMP4")],
        mobileMP4: activeContent[headers.indexOf("mobileMP4")],
        mobileWebM: activeContent[headers.indexOf("mobileWebM")],
        desktopPoster: activeContent[headers.indexOf("desktopPoster")],
        mobilePoster: activeContent[headers.indexOf("MobilePoster")],
        title: activeContent[headers.indexOf("title")],
      };

      return result;
    } catch (error) {
      console.error("Error fetching video8 data:", error);
      return null;
    }
  }

  static async fetchFooterData(sheetId) {
    try {
      const response = await fetch(
        `https://api.adcropper.com/getsheet/${sheetId}`
      );
      const data = await response.json();

      // Parse the string JSON inside the array
      const parsedData = JSON.parse(data[0]);
      const values = parsedData.values;
      const headers = values[0];

      // Get active footer links and group them by section
      const footerLinks = values
        .slice(1)
        .filter((row) => row[headers.indexOf("isActive")] === "TRUE")
        .map((row) => ({
          section: row[headers.indexOf("section")],
          linkText: row[headers.indexOf("linkText")],
          linkHref: row[headers.indexOf("linkHref")],
          order: parseInt(row[headers.indexOf("order")]) || 0,
        }))
        .sort((a, b) => a.order - b.order);

      // Group links by section
      const groupedLinks = footerLinks.reduce((acc, link) => {
        if (!acc[link.section]) {
          acc[link.section] = [];
        }
        acc[link.section].push({
          text: link.linkText,
          href: link.linkHref,
        });
        return acc;
      }, {});

      return groupedLinks;
    } catch (error) {
      console.error("Error fetching footer data:", error);
      return null;
    }
  }

  static async fetchRoomsData(sheetId) {
    try {
      const response = await fetch(
        `https://api.adcropper.com/getsheet/${sheetId}`
      );
      const data = await response.json();

      // Parse the string JSON inside the array
      const parsedData = JSON.parse(data[0]);
      const values = parsedData.values;
      const headers = values[0];

      // Get section info from the first data row
      const sectionInfo = {
        title:
          values[1][headers.indexOf("Section Title")] ||
          "Join Our Social Rooms!",
        description:
          values[1][headers.indexOf("Section Description")] ||
          "Play Together with streamers and our community.\nFollow your favorite streamer and join in on the excitement!",
      };

      // Map room data starting from row 1
      const rooms = values
        .slice(1)
        .map((row) => ({
          label: row[headers.indexOf("roomLabel")],
          userName: row[headers.indexOf("roomUserName")],
          avatar: row[headers.indexOf("roomUserAvatar")],
          url: row[headers.indexOf("roomUrl")],
        }))
        .filter((room) => room.userName); // Filter out rooms without username

      return {
        section: sectionInfo,
        rooms: rooms,
      };
    } catch (error) {
      console.error("Error fetching rooms data:", error);
      return null;
    }
  }
}
