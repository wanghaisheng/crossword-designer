import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { ReactiveFormsModule } from "@angular/forms";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { PuzzleGridComponent } from "./puzzle-grid/puzzle-grid.component";
import { SelectedClueComponent } from "./selected-clue/selected-clue.component";

@NgModule({
  declarations: [AppComponent, PuzzleGridComponent, SelectedClueComponent],
  imports: [BrowserModule, AppRoutingModule, FormsModule, ReactiveFormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
