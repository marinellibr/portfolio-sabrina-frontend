import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export type ProjectAsset = {
  name: string;
  url: string;
};

type GithubContentItem = {
  name: string;
  download_url: string | null;
  type: string;
};

const ASSET_BASE_URL =
  'https://raw.githubusercontent.com/marinellibr/portfolio-sabrina-resources/main/project-assets';
const ASSET_API_URL =
  'https://api.github.com/repos/marinellibr/portfolio-sabrina-resources/contents/project-assets?ref=main';

export const FALLBACK_PROJECT_ASSETS: ProjectAsset[] = [
  {
    name: 'banner-creamy.png',
    url: `${ASSET_BASE_URL}/banner-creamy.png`,
  },
];

@Injectable({ providedIn: 'root' })
export class GithubProjectAssetsService {
  private readonly http = inject(HttpClient);
  private cachedAssets: ProjectAsset[] | null = null;
  private pendingRequest: Promise<ProjectAsset[]> | null = null;

  getAssets(forceRefresh = false): Promise<ProjectAsset[]> {
    if (!forceRefresh && this.cachedAssets) {
      return Promise.resolve(this.cachedAssets);
    }

    if (!forceRefresh && this.pendingRequest) {
      return this.pendingRequest;
    }

    this.pendingRequest = this.fetchAssets()
      .then((assets) => {
        this.cachedAssets = assets.length ? assets : FALLBACK_PROJECT_ASSETS;
        return this.cachedAssets;
      })
      .finally(() => {
        this.pendingRequest = null;
      });

    return this.pendingRequest;
  }

  clearCache(): void {
    this.cachedAssets = null;
  }

  private async fetchAssets(): Promise<ProjectAsset[]> {
    const items = await firstValueFrom(this.http.get<GithubContentItem[]>(ASSET_API_URL));

    return items
      .filter((item) => item.type === 'file' && item.download_url)
      .map((item) => ({
        name: item.name,
        url: item.download_url as string,
      }));
  }
}
