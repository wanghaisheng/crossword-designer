import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PuzzleEditingComponent } from "./puzzle-editing/puzzle-editing.component";
import { ClueEditingComponent } from "./clue-editing/clue-editing.component";
import { PuzzleReviewComponent } from "./puzzle-review/puzzle-review.component";
import { LoadPuzzleComponent } from "./load-puzzle/load-puzzle.component";
import { AnswerDraftingComponent } from "./answer-drafting/answer-drafting.component";

const routes: Routes = [
  { path: "load", component: LoadPuzzleComponent },
  { path: "answers", component: AnswerDraftingComponent },
  { path: "puzzle", component: PuzzleEditingComponent },
  { path: "clues", component: ClueEditingComponent },
  { path: "review", component: PuzzleReviewComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
