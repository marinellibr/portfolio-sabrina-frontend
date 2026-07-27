import { CommonModule } from "@angular/common";
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject,
} from "@angular/core";
import { ProjectPostImage } from "../../models/post.model";
import {
  FALLBACK_PROJECT_ASSETS,
  GithubProjectAssetsService,
  ProjectAsset,
} from "../../services/github-project-assets.service";
import { TranslatePipe } from "@ngx-translate/core";

@Component({
  selector: "app-image-selection",
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: "./image-selection.component.html",
  styleUrls: ["./image-selection.component.scss"],
})
export class ImageSelectionComponent implements OnInit, OnChanges {
  private readonly githubProjectAssetsService = inject(
    GithubProjectAssetsService,
  );

  @Input() mult = false;
  @Input() selectedImages: ProjectPostImage[] = [];
  @Output() selectedFilesChange = new EventEmitter<ProjectPostImage[]>();

  files: ProjectAsset[] = FALLBACK_PROJECT_ASSETS;
  selectedFileNames: string[] = [];
  coverFileNames: string[] = [];
  loadingFiles = true;
  fileLoadError = false;

  ngOnInit(): void {
    void this.loadFiles();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["selectedImages"] && this.files.length) {
      this.applySelectedImages();
    }
  }

  get selectedFiles(): ProjectAsset[] {
    return this.files.filter((file) =>
      this.selectedFileNames.includes(file.name),
    );
  }

  isSelected(fileName: string): boolean {
    return this.selectedFileNames.includes(fileName);
  }

  isCoverSelected(fileName: string): boolean {
    return this.coverFileNames.includes(fileName);
  }

  onToggle(fileName: string, checked: boolean): void {
    if (this.mult) {
      this.selectedFileNames = checked
        ? [...this.selectedFileNames, fileName]
        : this.selectedFileNames.filter(
            (selectedFileName) => selectedFileName !== fileName,
          );
    } else {
      this.selectedFileNames = checked ? [fileName] : [];
    }

    this.coverFileNames = this.coverFileNames.filter((coverFileName) =>
      this.selectedFileNames.includes(coverFileName),
    );

    this.selectedFilesChange.emit(this.exportSelectedFiles());
  }

  onCoverToggle(fileName: string, checked: boolean): void {
    if (!this.mult) {
      this.coverFileNames = checked ? [fileName] : [];
      this.selectedFilesChange.emit(this.exportSelectedFiles());
      return;
    }

    const coverFileNames = new Set(this.coverFileNames);

    if (checked) {
      coverFileNames.add(fileName);
    } else {
      coverFileNames.delete(fileName);
    }

    this.coverFileNames = Array.from(coverFileNames).filter((coverFileName) =>
      this.selectedFileNames.includes(coverFileName),
    );
    this.selectedFilesChange.emit(this.exportSelectedFiles());
  }

  exportSelectedFiles(): ProjectPostImage[] {
    return this.selectedFiles.map((file) => ({
      url: file.url,
      cover: this.isCoverSelected(file.name),
    }));
  }

  refreshFiles(): void {
    void this.loadFiles(true);
  }

  private async loadFiles(forceRefresh = false): Promise<void> {
    this.loadingFiles = true;
    this.fileLoadError = false;

    try {
      this.files =
        await this.githubProjectAssetsService.getAssets(forceRefresh);
    } catch (error) {
      this.fileLoadError = true;
      this.files = FALLBACK_PROJECT_ASSETS;
      console.error("Error loading project asset files:", error);
    } finally {
      this.applySelectedImages();
      this.loadingFiles = false;
    }
  }

  private applySelectedImages(): void {
    if (!this.selectedImages?.length) {
      this.selectedFileNames = [];
      this.coverFileNames = [];
      return;
    }

    const selectedFileNames = this.selectedImages
      .map((image) => this.files.find((file) => file.url === image.url)?.name)
      .filter((fileName): fileName is string => Boolean(fileName));

    this.selectedFileNames = this.mult
      ? selectedFileNames
      : selectedFileNames.slice(0, 1);

    const coverFileNames = this.selectedImages
      .filter((image) => image.cover)
      .map((image) => this.files.find((file) => file.url === image.url)?.name)
      .filter((fileName): fileName is string =>
        Boolean(fileName && this.selectedFileNames.includes(fileName)),
      );

    this.coverFileNames = this.mult
      ? Array.from(new Set(coverFileNames))
      : coverFileNames.slice(0, 1);
  }
}
