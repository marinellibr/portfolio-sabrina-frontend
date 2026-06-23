import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { TranslatePipe, TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-contact",
  imports: [CommonModule, TranslatePipe],
  templateUrl: "./contact.component.html",
  styleUrl: "./contact.component.scss",
})
export class ContactComponent {
  rawUrl =
    "https://raw.githubusercontent.com/marinellibr/portfolio-sabrina-resources/8515e4debbfd5e4afeb106becac78dcdb0ca52f7/images/";

  constructor(private translateService: TranslateService) {}

  contacts: any[] = [
    {
      icon: "mail",
      labelKey: "CONTACT.EMAIL_LABEL",
      valueKey: "CONTACT.EMAIL_VALUE",
      value: "sabrina21cardoso@gmail.com",
    },
    {
      icon: "linkedin",
      labelKey: "CONTACT.LINKEDIN_LABEL",
      valueKey: "CONTACT.LINKEDIN_VALUE",
      value: "linkedin.com/in/sabrinascardoso",
    },
    {
      icon: "zap",
      labelKey: "CONTACT.WHATSAPP_LABEL",
      valueKey: "CONTACT.WHATSAPP_VALUE",
      value: "+55 (11) 98939-8426",
    },
    {
      icon: "work",
      labelKey: "CONTACT.CV_LABEL",
      valueKey: "CONTACT.CV_VALUE",
      value: "baixe em pdf (:)",
    },
    {
      icon: "behance",
      labelKey: "CONTACT.BEHANCE_LABEL",
      valueKey: "CONTACT.BEHANCE_VALUE",
      value: "behance.net/sabrinacardoso7",
    },
  ];

  handleContactClick(contact: any): void {
    switch (contact.icon) {
      case "mail":
        window.location.href = `mailto:${contact.value}`;
        break;
      case "zap":
        const whatsappNumber = contact.value.replace(/\D/g, "");
        const message = this.translateService.instant(
          "CONTACT.WHATSAPP_MESSAGE",
        );
        const encodedMessage = encodeURIComponent(message);
        window.open(
          `https://wa.me/${whatsappNumber}?text=${encodedMessage}`,
          "_blank",
        );
        break;
      case "work":
        console.log("CV clicado");
        break;
      case "linkedin":
      case "behance":
        window.open(`https://${contact.value}`, "_blank");
        break;
    }
  }
}
