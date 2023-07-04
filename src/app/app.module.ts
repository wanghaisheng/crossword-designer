import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { PuzzleGridComponent } from "./puzzle-grid/puzzle-grid.component";
import { ClueListComponent } from "./clue-list/clue-list.component";

@NgModule({
  declarations: [AppComponent, PuzzleGridComponent, ClueListComponent],
  imports: [BrowserModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
