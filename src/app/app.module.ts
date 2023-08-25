import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { ReactiveFormsModule } from "@angular/forms";

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
import { ClueDraftingComponent } from "./clue-drafting/clue-drafting.component";
import { SidebarNavComponent } from "./sidebar-nav/sidebar-nav.component";
import { PuzzleReviewComponent } from "./puzzle-review/puzzle-review.component";
import { LoadPuzzleComponent } from "./load-puzzle/load-puzzle.component";

@NgModule({
  declarations: [
    AppComponent,
    PuzzleEditingComponent,
    SelectedClueComponent,
    ClueDraftingComponent,
    SidebarNavComponent,
    PuzzleReviewComponent,
    LoadPuzzleComponent,
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
