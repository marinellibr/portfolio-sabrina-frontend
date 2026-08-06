import { Injectable, inject } from "@angular/core";
import { LanguageService } from "./language.service";

type CurriculumFile = {
  fileName: string;
  url: string;
};

@Injectable({ providedIn: "root" })
export class CurriculumService {
  private readonly languageService = inject(LanguageService);

  private readonly files: Record<"pt" | "en", CurriculumFile> = {
    pt: {
      fileName: "cv_sabrina_cardoso.pdf",
      url: "https://raw.githubusercontent.com/marinellibr/portfolio-sabrina-resources/main/docs/cv_sabrina_cardoso.pdf",
    },
    en: {
      fileName: "sabrina_cardoso_cv.pdf",
      url: "https://raw.githubusercontent.com/marinellibr/portfolio-sabrina-resources/main/docs/sabrina_cardoso_cv.pdf",
    },
  };

  async open(): Promise<void> {
    const curriculum = this.files[this.languageService.current];

    if (this.isLinkedInInAppBrowser()) {
      window.open(curriculum.url, "_blank", "noopener,noreferrer");
      return;
    }

    const targetWindow = window.open("", "_blank");

    if (!targetWindow) {
      window.open(curriculum.url, "_blank");
      return;
    }

    try {
      const response = await fetch(curriculum.url);

      if (!response.ok) {
        targetWindow.location.href = curriculum.url;
        return;
      }

      const blob = await response.blob();
      const pdfBlob = new Blob([blob], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(pdfBlob);

      targetWindow.location.href = blobUrl;

      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch {
      targetWindow.location.href = curriculum.url;
    }
  }

  private isLinkedInInAppBrowser(): boolean {
    if (typeof navigator === "undefined") {
      return false;
    }

    return /LinkedInApp|LinkedIn/i.test(navigator.userAgent);
  }
}
