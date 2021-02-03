import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { ReactiveComponentModule } from "@ngrx/component";
import { SearchComponent } from "./search.component";

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: SearchComponent
      }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    ReactiveComponentModule
  ],
  declarations: [ SearchComponent ]
})
export class SearchModule { }
