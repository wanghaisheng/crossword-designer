import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PuzzleEditingComponent } from "./puzzle-editing/puzzle-editing.component";
import { ClueEditingComponent } from "./clue-editing/clue-editing.component";
import { PuzzleReviewComponent } from "./puzzle-review/puzzle-review.component";
import { LoadPuzzleComponent } from "./load-puzzle/load-puzzle.component";
import { AnswerDraftingComponent } from "./answer-drafting/answer-drafting.component";
import { PuzzleStatsComponent } from "./puzzle-stats/puzzle-stats.component";
import { SignInComponent } from "./sign-in/sign-in.component";

const routes: Routes = [
  { path: "", component: SignInComponent },
  { path: "load", component: LoadPuzzleComponent },
  { path: "answers", component: AnswerDraftingComponent },
  { path: "puzzle", component: PuzzleEditingComponent },
  { path: "clues", component: ClueEditingComponent },
  { path: "review", component: PuzzleReviewComponent },
  { path: "stats", component: PuzzleStatsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
