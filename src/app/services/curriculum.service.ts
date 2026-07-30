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
    const response = await fetch(curriculum.url);

    if (!response.ok) {
      window.open(curriculum.url, "_blank");
      return;
    }

    const blob = await response.blob();
    const pdfBlob = new Blob([blob], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(pdfBlob);

    window.open(blobUrl, "_blank");

    setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
  }
}
