import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PuzzleEditingComponent } from "./puzzle-editing/puzzle-editing.component";
import { ClueDraftingComponent } from "./clue-drafting/clue-drafting.component";
import { PuzzleReviewComponent } from "./puzzle-review/puzzle-review.component";
import { LoadPuzzleComponent } from "./load-puzzle/load-puzzle.component";

const routes: Routes = [
  { path: "load", component: LoadPuzzleComponent },
  { path: "clues", component: ClueDraftingComponent },
  { path: "puzzle", component: PuzzleEditingComponent },
  { path: "review", component: PuzzleReviewComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
