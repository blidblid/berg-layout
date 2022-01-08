import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BergLayoutComponent } from './layout.component';

describe('LayoutComponent', () => {
  let component: BergLayoutComponent;
  let fixture: ComponentFixture<BergLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BergLayoutComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BergLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
