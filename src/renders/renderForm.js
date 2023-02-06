export default (elements, i18nextInstance) => (path, value) => {
  const status = elements.statusMassage
    switch (value) {
      case 'neutral':
        status.classList.remove('text-sucess', 'text-danger');
        status.textContent = i18nextInstance.t('statusMessage.neutral');
        break;
      case 'invalid':
        status.classList.remove('text-sucess', 'text-danger');
        status.classList.add('text-danger');
        status.textContent = i18nextInstance.t('statusMessage.invalid');
        elements.input.value = '';
        elements.input.focus();
        break;
      case 'valid':
        status.classList.remove('text-sucess', 'text-danger');
        status.classList.add('text-sucess');
        status.textContent = i18nextInstance.t('statusMessage.valid');
        elements.input.value = '';
        elements.input.focus();
        break;
      case 'duplicate':
        status.classList.remove('text-sucess', 'text-danger');
        status.classList.add('text-danger');
        status.textContent = i18nextInstance.t('statusMessage.duplicate');
        elements.input.value = '';
        elements.input.focus();
        break;
      case 'noRss':
        status.classList.remove('text-sucess', 'text-danger');
        status.classList.add('text-danger');
        status.textContent = i18nextInstance.t('statusMessage.noRss');
        elements.input.value = '';
        elements.input.focus();
        break;
        case 'networkError':
          status.classList.remove('text-sucess', 'text-danger');
          status.classList.add('text-danger');
          status.textContent = i18nextInstance.t('statusMessage.noRss');
          elements.input.value = '';
          elements.input.focus();
          break;
      default:
        throw new Error(`Unknown data state: ${value}`);
    }
  };