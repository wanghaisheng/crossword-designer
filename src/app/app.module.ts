import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { PuzzleEditingComponent } from "./puzzle-editing/puzzle-editing.component";
import { SelectedClueComponent } from "./selected-clue/selected-clue.component";
import { initializeApp, provideFirebaseApp } from "@angular/fire/app";
import { environment } from "../environments/environment";
import { provideAnalytics, getAnalytics, ScreenTrackingService, UserTrackingService } from "@angular/fire/analytics";
import { provideAuth, getAuth } from "@angular/fire/auth";
import { provideFirestore, getFirestore } from "@angular/fire/firestore";
import { provideFunctions, getFunctions } from "@angular/fire/functions";
import { provideStorage, getStorage } from "@angular/fire/storage";
import { ClueEditingComponent } from "./clue-editing/clue-editing.component";
import { SidebarNavComponent } from "./sidebar-nav/sidebar-nav.component";
import { PuzzleReviewComponent } from "./puzzle-review/puzzle-review.component";
import { LoadPuzzleComponent } from "./load-puzzle/load-puzzle.component";
import { AnswerDraftingComponent } from "./answer-drafting/answer-drafting.component";
import { GridComponent } from "./components/grid/grid.component";
import { PuzzleStatsComponent } from './puzzle-stats/puzzle-stats.component';

@NgModule({
  declarations: [
    AppComponent,
    PuzzleEditingComponent,
    SelectedClueComponent,
    ClueEditingComponent,
    SidebarNavComponent,
    PuzzleReviewComponent,
    LoadPuzzleComponent,
    AnswerDraftingComponent,
    GridComponent,
    PuzzleStatsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAnalytics(() => getAnalytics()),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideFunctions(() => getFunctions()),
    provideStorage(() => getStorage()),
  ],
  providers: [ScreenTrackingService, UserTrackingService],
  bootstrap: [AppComponent],
})
export class AppModule {}
