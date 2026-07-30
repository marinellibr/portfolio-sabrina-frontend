import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export type ProjectAssetType = 'file' | 'dir';

export type ProjectAsset = {
  name: string;
  path: string;
  type: ProjectAssetType;
  url: string | null;
};

type GithubContentItem = {
  name: string;
  path: string;
  download_url: string | null;
  type: string;
};

const ASSET_BASE_URL =
  'https://raw.githubusercontent.com/marinellibr/portfolio-sabrina-resources/main/project-assets';
const ASSET_API_URL =
  'https://api.github.com/repos/marinellibr/portfolio-sabrina-resources/contents/project-assets';

export const FALLBACK_PROJECT_ASSETS: ProjectAsset[] = [
  {
    name: 'banner-creamy.png',
    path: 'banner-creamy.png',
    type: 'file',
    url: `${ASSET_BASE_URL}/banner-creamy.png`,
  },
];

@Injectable({ providedIn: 'root' })
export class GithubProjectAssetsService {
  private readonly http = inject(HttpClient);
  private cachedAssets = new Map<string, ProjectAsset[]>();
  private pendingRequests = new Map<string, Promise<ProjectAsset[]>>();

  getAssets(path = '', forceRefresh = false): Promise<ProjectAsset[]> {
    if (!forceRefresh && this.cachedAssets.has(path)) {
      return Promise.resolve(this.cachedAssets.get(path) as ProjectAsset[]);
    }

    if (!forceRefresh && this.pendingRequests.has(path)) {
      return this.pendingRequests.get(path) as Promise<ProjectAsset[]>;
    }

    const request = this.fetchAssets(path)
      .then((assets) => {
        const resolvedAssets = assets.length && !path ? assets : assets;
        this.cachedAssets.set(
          path,
          resolvedAssets.length || path ? resolvedAssets : FALLBACK_PROJECT_ASSETS,
        );
        return this.cachedAssets.get(path) as ProjectAsset[];
      })
      .finally(() => {
        this.pendingRequests.delete(path);
      });

    this.pendingRequests.set(path, request);
    return request;
  }

  clearCache(): void {
    this.cachedAssets.clear();
  }

  private async fetchAssets(path: string): Promise<ProjectAsset[]> {
    const requestPath = path
      ? `${ASSET_API_URL}/${encodeURIComponent(path).replace(/%2F/g, '/')}?ref=main`
      : `${ASSET_API_URL}?ref=main`;
    const items = await firstValueFrom(this.http.get<GithubContentItem[]>(requestPath));

    return items
      .filter((item) => item.type === 'file' || item.type === 'dir')
      .map((item) => ({
        name: item.name,
        path: item.path.replace(/^project-assets\/?/, ''),
        type: (item.type === 'dir' ? 'dir' : 'file') as ProjectAssetType,
        url: item.download_url,
      }))
      .sort((first, second) => {
        if (first.type !== second.type) {
          return first.type === 'dir' ? -1 : 1;
        }

        return first.name.localeCompare(second.name);
      });
  }
}
