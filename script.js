$(document).ready(function () {
  const $videos = $("video");
  const $slider = $("#timelineSlider");
  const $playPauseButton = $("#playPauseButton");
  const $tooltip = $("#sliderTooltip");
  let isPlaying = false;

  // Play/Pause all videos
  $playPauseButton.on("click", function () {
    if (isPlaying) {
      $videos.each(function () {
        this.pause();
      });
      $playPauseButton.html(
        "<i class='fa fa-play me-3' style='cursor: pointer; font-size: 1.5rem;'></i>"
      );
    } else {
      $videos.each(function () {
        this.play();
      });
      $playPauseButton.html(
        "<i class='fa fa-pause me-3' style='cursor: pointer; font-size: 1.5rem;'></i>"
      );
    }
    isPlaying = !isPlaying;
  });

  // Sync slider with video timelines
  $slider.on("input", function () {
    const sliderValue = $(this).val();
    $videos.each(function () {
      const duration = this.duration;
      if (!isNaN(duration)) {
        this.currentTime = (sliderValue / 100) * duration;
      }
    });
  });

  $videos.on("timeupdate", function () {
    const totalDuration = $videos[0]?.duration; // Handle potential undefined video durations
    if (!isNaN(totalDuration) && totalDuration > 0) {
      const averageTime =
        $videos.toArray().reduce((sum, video) => sum + video.currentTime, 0) /
        $videos.length;
      $slider.val((averageTime / totalDuration) * 100);
    }
  });

  // Pause videos on slider interaction
  $slider.on("mousedown touchstart", function () {
    $videos.each(function () {
      this.pause();
    });
    $playPauseButton.html(
      "<i class='fa fa-play me-3' style='cursor: pointer; font-size: 1.5rem;'></i>"
    );
    isPlaying = false;
  });

  // Sync play/pause states of videos
  $videos.on("play", function () {
    if (!isPlaying) {
      isPlaying = true;
      $playPauseButton.html(
        "<i class='fa fa-pause me-3' style='cursor: pointer; font-size: 1.5rem;'></i>"
      );
    }
  });

  $videos.on("pause", function () {
    if ($videos.filter((_, video) => !video.paused).length === 0) {
      isPlaying = false;
      $playPauseButton.html(
        "<i class='fa fa-play me-3' style='cursor: pointer; font-size: 1.5rem;'></i>"
      );
    }
  });

  // Exemple de données JSON
  const jsonData = {
    labels: Array.from({ length: 101 }, (_, i) => i), // 0 à 100 (timeline)
    data: Array.from({ length: 101 }, () => Math.random() * 100), // Valeurs aléatoires
  };

  // Configuration du graphique
  const ctx = document.getElementById("timelineChart").getContext("2d");
  const timelineChart = new Chart(ctx, {
    type: "line", // Utilisation d'un graphique en aire
    data: {
      labels: jsonData.labels,
      datasets: [
        {
          // label: "Timeline Data",
          data: jsonData.data,
          backgroundColor: "rgba(128, 128, 128, 0.2)",
          borderColor: "rgba(128, 128, 128, 0.2)",
          borderWidth: 0,
          pointStyle: false,
          fill: true, // Active l'aire sous la courbe
          tension: 0.4, // Lissage des courbes
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          display: false, // Hides the entire x-axis
        },
        y: {
          display: false, // Hides the entire y-axis
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false, // Disables the hover popup (tooltip)
        },
      },
    },
  });

  const ctx2 = $("#stackedBarChart")[0].getContext("2d");

  const stackedBarChart = new Chart(ctx2, {
    type: "bar",
    data: {
      labels: ["la part"], // Example labels
      datasets: [
        {
          label: "Solaire",
          data: [10], // Example data
          backgroundColor: "#d66b08",
        },
        {
          label: "Nucléraire",
          data: [15], // Example data
          backgroundColor: "#d6a508",
        },
        {
          label: "Hydrolique",
          data: [25], // Example data
          backgroundColor: "#296bbd",
        },
        {
          label: "Eolien",
          data: [33], // Example data
          backgroundColor: "#73ceb5",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false, // Show the legend
          position: "top", // Position of the legend
        },
        tooltip: {
          enabled: true, // Enable tooltips on hover
        },
      },
      scales: {
        x: {
          display: false,
          stacked: true, // Enable stacked bars for x-axis
        },
        y: {
          display: false,
          stacked: true, // Enable stacked bars for y-axis
          beginAtZero: true, // Ensure y-axis starts at zero
          max: 100, // Max value for percentage
        },
      },
    },
  });

  // Synchrnizing
  $slider.on("input", function () {
    const sliderValue = $(this).val();
    timelineChart.update("none"); // Mise à jour sans animation

    // Update the tooltip text
    $tooltip.text(sliderValue);

    // Calculate the position of the tooltip
    const sliderWidth = $slider.width();
    const sliderOffset = $slider.offset().left;
    const sliderMin = $slider.attr("min");
    const sliderMax = $slider.attr("max");
    const tooltipLeft =
      ((sliderValue - sliderMin) / (sliderMax - sliderMin)) * sliderWidth + 45;

    // Position the tooltip
    $tooltip.css({
      left: tooltipLeft + "px",
      display: "block", // Show the tooltip
    });
  });
  // Hide tooltip when the user stops interacting
  $slider.on("mouseup touchend", function () {
    $tooltip.css("display", "none");
  });
});
