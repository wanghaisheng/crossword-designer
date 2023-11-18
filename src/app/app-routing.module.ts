import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PuzzleEditingComponent } from "./pages/puzzle-editing/puzzle-editing.component";
import { ClueEditingComponent } from "./pages/clue-editing/clue-editing.component";
import { PuzzleReviewComponent } from "./pages/puzzle-review/puzzle-review.component";
import { LoadPuzzleComponent } from "./pages/load-puzzle/load-puzzle.component";
import { AnswerDraftingComponent } from "./pages/answer-drafting/answer-drafting.component";
import { PuzzleStatsComponent } from "./pages/puzzle-stats/puzzle-stats.component";
import { SignInComponent } from "./pages/sign-in/sign-in.component";

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
