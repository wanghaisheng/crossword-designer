import { Component, OnInit } from "@angular/core";
import { AuthService, User } from "./services/auth.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  public title = "crossword-designer";
  public signedIn = false;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user: User | null) => {
      this.signedIn = user != null;

      // Re-route to sign-in page if user not signed in
      if (!this.signedIn) {
        this.router.navigateByUrl("/");
      }
    });
  }
}
