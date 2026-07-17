document.addEventListener("DOMContentLoaded", () => {

    console.log("Jobs Dashboard Loaded");

    const viewButtons = document.querySelectorAll(".view-btn");

    viewButtons.forEach((button) => {

        button.addEventListener("mouseenter", () => {

            button.style.transform = "scale(1.05)";

        });

        button.addEventListener("mouseleave", () => {

            button.style.transform = "scale(1)";

        });

    });

});