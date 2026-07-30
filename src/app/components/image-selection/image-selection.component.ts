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
  currentPath = "";
  selectedFileUrls: string[] = [];
  coverFileUrls: string[] = [];
  selectedAssets = new Map<string, ProjectAsset>();
  loadingFiles = true;
  fileLoadError = false;

  ngOnInit(): void {
    void this.loadFiles();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["selectedImages"] && this.files.length) {
      this.syncSelectedImagesFromInput();
    }
  }

  get selectedFiles(): ProjectAsset[] {
    return this.selectedFileUrls
      .map((url) => this.selectedAssets.get(url))
      .filter((file): file is ProjectAsset => Boolean(file));
  }

  get pathSegments(): string[] {
    return this.currentPath ? this.currentPath.split("/") : [];
  }

  get currentFolderName(): string {
    return this.pathSegments[this.pathSegments.length - 1] ?? "";
  }

  isSelected(file: ProjectAsset): boolean {
    return Boolean(file.url && this.selectedFileUrls.includes(file.url));
  }

  isCoverSelected(file: ProjectAsset): boolean {
    return Boolean(file.url && this.coverFileUrls.includes(file.url));
  }

  onToggle(file: ProjectAsset, checked: boolean): void {
    if (!file.url) {
      return;
    }

    if (this.mult) {
      this.selectedFileUrls = checked
        ? Array.from(new Set([...this.selectedFileUrls, file.url]))
        : this.selectedFileUrls.filter(
            (selectedFileUrl) => selectedFileUrl !== file.url,
          );
    } else {
      this.selectedFileUrls = checked ? [file.url] : [];
    }

    if (checked) {
      this.selectedAssets.set(file.url, file);
    } else {
      this.selectedAssets.delete(file.url);
    }

    this.coverFileUrls = this.coverFileUrls.filter((coverFileUrl) =>
      this.selectedFileUrls.includes(coverFileUrl),
    );

    this.selectedFilesChange.emit(this.exportSelectedFiles());
  }

  onCoverToggle(file: ProjectAsset, checked: boolean): void {
    if (!file.url) {
      return;
    }

    if (!this.mult) {
      this.coverFileUrls = checked ? [file.url] : [];
      this.selectedFilesChange.emit(this.exportSelectedFiles());
      return;
    }

    const coverFileUrls = new Set(this.coverFileUrls);

    if (checked) {
      coverFileUrls.add(file.url);
    } else {
      coverFileUrls.delete(file.url);
    }

    this.coverFileUrls = Array.from(coverFileUrls).filter((coverFileUrl) =>
      this.selectedFileUrls.includes(coverFileUrl),
    );
    this.selectedFilesChange.emit(this.exportSelectedFiles());
  }

  exportSelectedFiles(): ProjectPostImage[] {
    return this.selectedFiles.map((file) => ({
      url: file.url as string,
      cover: this.isCoverSelected(file),
    }));
  }

  refreshFiles(): void {
    void this.loadFiles(this.currentPath, true);
  }

  openFolder(file: ProjectAsset): void {
    if (file.type !== "dir") {
      return;
    }

    void this.loadFiles(file.path);
  }

  goBack(): void {
    if (!this.currentPath) {
      return;
    }

    const parentPath = this.pathSegments.slice(0, -1).join("/");
    void this.loadFiles(parentPath);
  }

  private async loadFiles(path = this.currentPath, forceRefresh = false): Promise<void> {
    this.loadingFiles = true;
    this.fileLoadError = false;

    try {
      this.files =
        await this.githubProjectAssetsService.getAssets(path, forceRefresh);
      this.currentPath = path;
    } catch (error) {
      this.fileLoadError = true;
      this.files = FALLBACK_PROJECT_ASSETS;
      this.currentPath = "";
      console.error("Error loading project asset files:", error);
    } finally {
      this.cacheVisibleSelectedFiles();
      this.loadingFiles = false;
    }
  }

  private syncSelectedImagesFromInput(): void {
    if (!this.selectedImages?.length) {
      this.selectedFileUrls = [];
      this.coverFileUrls = [];
      this.selectedAssets.clear();
      return;
    }

    this.selectedImages.forEach((image) => {
      if (!this.selectedAssets.has(image.url)) {
        this.selectedAssets.set(image.url, {
          name: image.url.split("/").pop() ?? image.url,
          path: image.url,
          type: "file",
          url: image.url,
        });
      }
    });

    const selectedFileUrls = this.selectedImages.map((image) => image.url);

    this.selectedFileUrls = this.mult
      ? Array.from(new Set(selectedFileUrls))
      : selectedFileUrls.slice(0, 1);

    const coverFileUrls = this.selectedImages
      .filter((image) => image.cover)
      .map((image) => image.url)
      .filter((fileUrl) =>
        this.selectedFileUrls.includes(fileUrl),
      );

    this.coverFileUrls = this.mult
      ? Array.from(new Set(coverFileUrls))
      : coverFileUrls.slice(0, 1);

    this.cacheVisibleSelectedFiles();
  }

  private cacheVisibleSelectedFiles(): void {
    this.files
      .filter(
        (file) =>
          file.type === "file" &&
          file.url &&
          this.selectedFileUrls.includes(file.url),
      )
      .forEach((file) => {
        this.selectedAssets.set(file.url as string, file);
      });
  }
}
