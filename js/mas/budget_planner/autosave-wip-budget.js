(function (window, $, settings) {
  'use strict';

  window.AutoSave = {};
  window.AutoSave.start = function startAutoSave(form, manualSaveLinks, steps) {

    var $form = $(form),
        $manualSaveLinks = $(manualSaveLinks),
        $steps = $(steps);

    $steps.on('change', function () { window.AutoSave.dirty = true; });

    var autoSave = function autoSave() {
      var all_steps_valid = true;

      if (window.AutoSave.dirty) {
        window.AutoSave.dirty = false;

        $steps.each(function () {
          all_steps_valid = all_steps_valid && (this.isValid == undefined || this.isValid());
        });

        if (all_steps_valid) {
          $.ajax({
            url: $form.attr('action'),
            type: $form.attr('method'),
            data: $form.serialize() + '&autosave=1',
            success: function (data, status, xhr) { $(window.document).trigger('mas.budget.saved', [data, status, xhr]); },
            complete: function (xhr, status) { $(window.document).trigger('mas.budget.completed', [xhr, status]); },
            error: function (xhr, status, error) { $(window.document).trigger('mas.budget.error', [xhr, status, error]); }
          });
        }
      }
    };

    if ($form.size()) {
      window.setInterval(autoSave, settings.autosave_time_in_seconds);
    }

    $manualSaveLinks.on('click', function () {
      window.AutoSave.dirty = false;
    });

  };

}(this, jQuery, this.budgetPlanner.settings));
