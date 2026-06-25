import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { Navbar } from '../navbar/navbar';
import { Toast } from '../toast/toast';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Sidebar, Navbar, Toast, ConfirmDialog],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class Layout {
  mobileMenuOpen = false;
}
