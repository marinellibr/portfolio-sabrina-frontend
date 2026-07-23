import { CommonModule } from "@angular/common";
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from "@angular/core";
import { ProjectPostImage } from "../../models/post.model";
import {
  FALLBACK_PROJECT_ASSETS,
  GithubProjectAssetsService,
  ProjectAsset,
} from "../../services/github-project-assets.service";

@Component({
  selector: "app-image-selection",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./image-selection.component.html",
  styleUrls: ["./image-selection.component.scss"],
})
export class ImageSelectionComponent implements OnInit {
  private readonly githubProjectAssetsService = inject(
    GithubProjectAssetsService,
  );

  @Input() mult = false;
  @Output() selectedFilesChange = new EventEmitter<ProjectPostImage[]>();

  files: ProjectAsset[] = FALLBACK_PROJECT_ASSETS;
  selectedFileNames: string[] = [];
  coverFileNames: string[] = [];
  loadingFiles = true;
  fileLoadError = false;

  ngOnInit(): void {
    void this.loadFiles();
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
    this.coverFileNames = checked ? [fileName] : [];
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
      this.loadingFiles = false;
    }
  }
}
