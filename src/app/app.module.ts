import { NgModule } from "@angular/core";
import { provideAnalytics, getAnalytics, ScreenTrackingService, UserTrackingService } from "@angular/fire/analytics";
import { initializeApp, provideFirebaseApp } from "@angular/fire/app";
import { provideAuth, getAuth } from "@angular/fire/auth";
import { provideFirestore, getFirestore } from "@angular/fire/firestore";
import { provideFunctions, getFunctions } from "@angular/fire/functions";
import { provideStorage, getStorage } from "@angular/fire/storage";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

import { AnswerDraftingComponent } from "./pages/answer-drafting/answer-drafting.component";
import { ClueEditingComponent } from "./pages/clue-editing/clue-editing.component";
import { LoadPuzzleComponent } from "./pages/load-puzzle/load-puzzle.component";
import { PuzzleEditingComponent } from "./pages/puzzle-editing/puzzle-editing.component";
import { PuzzleReviewComponent } from "./pages/puzzle-review/puzzle-review.component";
import { PuzzleStatsComponent } from "./pages/puzzle-stats/puzzle-stats.component";
import { SignInComponent } from "./pages/sign-in/sign-in.component";

import { GridComponent } from "./components/grid/grid.component";
import { MetricGroupComponent } from "./components/metric-group/metric-group.component";
import { SelectedClueComponent } from "./components/selected-clue/selected-clue.component";
import { SidebarNavComponent } from "./components/sidebar-nav/sidebar-nav.component";

import { environment } from "../environments/environment";

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
    MetricGroupComponent,
    SignInComponent,
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
