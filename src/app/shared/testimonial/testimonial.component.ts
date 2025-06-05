import { Component, HostListener, OnInit } from '@angular/core';

declare var $: any;


@Component({
  selector: 'app-testimonial',
  templateUrl: './testimonial.component.html',
  styleUrls: ['./testimonial.component.scss'],
  standalone: true
})
export class TestimonialComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    this.windowResize();

  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.windowResize();
  }

  windowResize() {
    $('#recipeCarouselClient').carousel({
      interval: 10000
    })

    $('#recipeCarousel.carousel .carousel-item').each(function () {
      var minPerSlide = 3;
      var next = $(this).next();
      if (!next.length) {
        next = $(this).siblings(':first');
      }
      next.children(':first-child').clone().appendTo($(this));

      for (var i = 0; i < minPerSlide; i++) {
        next = next.next();
        if (!next.length) {
          next = $(this).siblings(':first');
        }
        next.children(':first-child').clone().appendTo($(this));
      }
    });

    $('#recipeCarouselClient').carousel({
      interval: 10000
    })

    $('#recipeCarouselClient.carousel .carousel-item').each(function () {
      var minPerSlide = 3;
      var next = $(this).next();
      if (!next.length) {
        next = $(this).siblings(':first');
      }
      next.children(':first-child').clone().appendTo($(this));

      for (var i = 0; i < minPerSlide; i++) {
        next = next.next();
        if (!next.length) {
          next = $(this).siblings(':first');
        }
        next.children(':first-child').clone().appendTo($(this));
      }
    });

  }

}
