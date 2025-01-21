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

  // jQuery function to generate the visualization
  $.fn.generateVisualization = function (data, categories) {
    // Clear the container
    this.empty();

    // Calculate total sum of data
    const total = data.reduce((acc, val) => acc + val, 0);

    // Generate bars for each category
    data.forEach((value, index) => {
      const percentage = (value / total) * 100; // Calculate percentage
      const category = categories[index];
      const color = category.color || "grey"; // Default color if not provided
      const name = category.name || `Category ${index + 1}`;

      // Create and style the bar
      const bar = $("<div></div>")
        .css({
          height: `${percentage}%`,
          width: "100%",
          backgroundColor: color,
          position: "relative",
        })
        .addClass("visual-bar")
        .attr("data-name", name) // Store category name
        .attr("data-value", value); // Store category value

      // Add hover tooltip
      bar.hover(
        function () {
          const tooltip = $("<div></div>")
            .addClass("tooltip")
            .text(`${name}: ${value}`) // Tooltip content
            .css({
              position: "absolute",
              top: "-30px",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              color: "#fff",
              padding: "5px 10px",
              borderRadius: "4px",
              whiteSpace: "nowrap",
              zIndex: 10,
            });
          $(this).append(tooltip);
        },
        function () {
          $(this).find(".tooltip").remove();
        }
      );

      // Append the bar to the container
      this.append(bar);
    });

    // Ensure the container fills its parent
    this.css({
      display: "flex",
      flexDirection: "column-reverse",
      width: "100%",
      height: "100%",
      position: "relative",
    });

    return this; // Allow chaining
  };

  // Function to update visualization
  $.fn.updateVisualization = function (newData) {
    const bars = this.find(".visual-bar");

    // Calculate total sum of new data
    const total = newData.reduce((acc, val) => acc + val, 0);

    // Animate the bars to the new values
    bars.each(function (index) {
      const newValue = newData[index];
      const newPercentage = (newValue / total) * 100;

      // Update the height with an animation
      $(this)
        .animate({ height: `${newPercentage}%` }, 1000) // Animate height
        .attr("data-value", newValue); // Update the stored value

      // Update tooltip content dynamically
      $(this).hover(
        function () {
          const tooltip = $("<div></div>")
            .addClass("tooltip")
            .text(`${$(this).attr("data-name")}: ${newValue}`) // Tooltip content
            .css({
              position: "absolute",
              top: "-30px",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              color: "#fff",
              padding: "5px 10px",
              borderRadius: "4px",
              whiteSpace: "nowrap",
              zIndex: 10,
            });
          $(this).append(tooltip);
        },
        function () {
          $(this).find(".tooltip").remove();
        }
      );
    });
  };

  // Example usage
  const data = [40, 30, 20, 10]; // Initial data
  const categories = [
    { name: "Solaire", color: "#d66b08" },
    { name: "Nucléaire", color: "#d6a508" },
    { name: "Hydrolique", color: "#296bbd" },
    { name: "Eolien", color: "#73ceb5" },
  ];

  const $visualizationContainer = $("#visualizationContainer");

  // Generate the initial visualization
  $visualizationContainer.generateVisualization(data, categories);

  // Example: Update the visualization after 3 seconds
  setTimeout(() => {
    const newData = [20, 40, 10, 30]; // New data
    $visualizationContainer.updateVisualization(newData);
  }, 3000);
});
