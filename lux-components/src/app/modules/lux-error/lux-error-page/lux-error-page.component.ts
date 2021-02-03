import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ILuxErrorPageConfig } from './lux-error-interfaces/lux-error-page-config.interface';
import { ILuxError } from './lux-error-interfaces/lux-error.interface';
import { LuxErrorStoreService } from './lux-error-services/lux-error-store.service';

@Component({
  selector: 'lux-error-page',
  templateUrl: './lux-error-page.component.html',
  styleUrls: ['./lux-error-page.component.scss']
})
export class LuxErrorPageComponent implements OnInit {
  get error(): ILuxError {
    return this.errorStore.error;
  }

  get errorConfig(): ILuxErrorPageConfig {
    return this.errorStore.config;
  }

  constructor(private router: Router, private errorStore: LuxErrorStoreService) {}

  ngOnInit() {}

  /**
   * Navigiert ueber den Router zum eingetragenen Home-Pfad
   */
  clickHomeRedirect() {
    this.router.navigate([this.errorConfig.homeRedirectUrl]);
  }
}
