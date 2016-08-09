/*!
 * @brief Messages
 *
 * Copyright (c) 2013, 2014 Bouygues Telecom
 *
 * The computer program contained herein contains proprietary
 * information which is the property of Bouygues Telecom.
 * The program may be used and/or copied only with the written
 * permission of Bouygues Telecom or in accordance with the
 * terms and conditions stipulated in the agreement/contract under
 * which the programs have been supplied.
 *
 * @author Stephane Carrez <stcarrez@bouyguestelecom.fr>
 */
var Bbox = Bbox || {};

Bbox.Messages = {
        forbidden_carac: 'Votre saisie ne doit pas contenir les caractères suivants ?;\\&/>',
        password_without_accent: 'Le mot de passe contient des caractères invalides. Veuillez utiliser des lettres sans accent et nombres uniquement.',
        password_required: 'Vous devez entrer votre mot de passe',
        password_bad_character: 'Le mot de passe contient des caractères invalides. Veuillez utiliser des lettres, nombres et ponctuation uniquement.',
        invalid_password: 'Erreur : le mot de passe indiqué est incorrect.',

        api_not_found_error: 'L\'opération n\'a pas été trouvée (erreur interne 404).',
        api_usage_error: 'L\'opération est invalide (erreur interne 400)',
        api_unauthorized_error: 'L\'authentification est incorrecte',
        api_forbidden_error: 'Vous devez vous authentifier avant de faire cette opération',
        api_remote_error: 'Pour garantir la sécurité de votre produit, en accès distant, il n\'est pas possible d\'accéder à cette fonctionnalité.',
        api_server_error: 'Le serveur a rencontré une erreur (erreur interne 500).',
        api_internal_error: 'L\'opération s\'est bien déroulée mais un contenu erroné à été envoyé',
        api_timeout_error: 'La box n\'a pas répondu.',
};
